import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { EvidenceVault } from '../target/types/evidence_vault';
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { expect } from 'chai';

describe('evidence_vault', () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  
  const program = anchor.workspace.EvidenceVault as Program<EvidenceVault>;
  
  // Test accounts
  let investigator: Keypair;
  let unauthorizedUser: Keypair;
  let submitter: Keypair;
  
  // Test data
  const caseId = 'CASE-001';
  const title = 'Test Investigation';
  const description = 'This is a test investigation case';
  
  // PDAs
  let casePda: PublicKey;
  let caseBump: number;

  before(async () => {
    // Generate test keypairs
    investigator = Keypair.generate();
    unauthorizedUser = Keypair.generate();
    submitter = Keypair.generate();
    
    // Fund accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(investigator.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL),
      'confirmed'
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL),
      'confirmed'
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(submitter.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL),
      'confirmed'
    );
    
    // Derive case PDA
    [casePda, caseBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('case'),
        Buffer.from(caseId),
        investigator.publicKey.toBuffer()
      ],
      program.programId
    );
  });

  describe('create_case', () => {
    it('should create a new case successfully', async () => {
      const tx = await program.methods
        .createCase(caseId, title, description)
        .accounts({
          case: casePda,
          investigator: investigator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investigator])
        .rpc();
      
      // Verify transaction was successful
      expect(tx).to.be.a('string');
      
      // Fetch and verify case account
      const caseAccount = await program.account.case.fetch(casePda);
      
      expect(caseAccount.investigator.toBase58()).to.equal(investigator.publicKey.toBase58());
      expect(caseAccount.caseId).to.equal(caseId);
      expect(caseAccount.title).to.equal(title);
      expect(caseAccount.description).to.equal(description);
      expect(JSON.stringify(caseAccount.status)).to.equal('{"open":{}}');
      expect(caseAccount.evidenceCount).to.equal(0);
      expect(caseAccount.reportHash).to.be.null;
      expect(caseAccount.createdAt.toNumber()).to.be.greaterThan(0);
      expect(caseAccount.updatedAt.toNumber()).to.be.greaterThan(0);
    });

    it('should emit CaseCreated event', async () => {
      // Create a new case for event testing
      const newCaseId = 'CASE-EVENT-001';
      const [newCasePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('case'),
          Buffer.from(newCaseId),
          investigator.publicKey.toBuffer()
        ],
        program.programId
      );
      
      let eventEmitted = false;
      let eventData: any = null;
      
      // Set up event listener
      const listener = program.addEventListener('caseCreated', (event) => {
        eventEmitted = true;
        eventData = event;
      });
      
      try {
        await program.methods
          .createCase(newCaseId, 'Event Test Case', 'Testing event emission')
          .accounts({
            case: newCasePda,
            investigator: investigator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([investigator])
          .rpc();
        
        // Wait a bit for event processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        expect(eventEmitted).to.be.true;
        expect(eventData.caseId).to.equal(newCaseId);
        expect(eventData.investigator.toBase58()).to.equal(investigator.publicKey.toBase58());
        expect(eventData.timestamp.toNumber()).to.be.greaterThan(0);
      } finally {
        await program.removeEventListener(listener);
      }
    });

    it('should fail when case_id exceeds max length', async () => {
      const longCaseId = 'A'.repeat(33); // Exceeds 32 char max
      const [invalidCasePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('case'),
          Buffer.from(longCaseId),
          investigator.publicKey.toBuffer()
        ],
        program.programId
      );
      
      try {
        await program.methods
          .createCase(longCaseId, 'Invalid', 'Should fail')
          .accounts({
            case: invalidCasePda,
            investigator: investigator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([investigator])
          .rpc();
        expect.fail('Should have thrown an error');
      } catch (e) {
        expect(e).to.be.an('error');
      }
    });
  });

  describe('add_evidence', () => {
    it('should add evidence to an open case', async () => {
      const dataHash = Buffer.alloc(32, 1); // 32-byte hash
      const metadataUri = 'ipfs://QmTest123';
      const evidenceDesc = 'Test evidence description';
      
      // Derive evidence PDA
      const caseAccountBefore = await program.account.case.fetch(casePda);
      const evidenceId = caseAccountBefore.evidenceCount;
      
      const [evidencePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('evidence'),
          Buffer.from(caseId),
          Buffer.from(new Uint32Array([evidenceId]).buffer)
        ],
        program.programId
      );
      
      const tx = await program.methods
        .addEvidence(
          { transactionTrace: {} }, // EvidenceType::TransactionTrace
          Array.from(dataHash),
          metadataUri,
          evidenceDesc
        )
        .accounts({
          case: casePda,
          evidence: evidencePda,
          submitter: submitter.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([submitter])
        .rpc();
      
      expect(tx).to.be.a('string');
      
      // Verify evidence account
      const evidenceAccount = await program.account.evidence.fetch(evidencePda);
      expect(evidenceAccount.caseId).to.equal(caseId);
      expect(evidenceAccount.evidenceId).to.equal(evidenceId);
      expect(JSON.stringify(evidenceAccount.evidenceType)).to.equal('{"transactionTrace":{}}');
      expect(Array.from(evidenceAccount.dataHash)).to.deep.equal(Array.from(dataHash));
      expect(evidenceAccount.metadataUri).to.equal(metadataUri);
      expect(evidenceAccount.description).to.equal(evidenceDesc);
      expect(evidenceAccount.submitter.toBase58()).to.equal(submitter.publicKey.toBase58());
      expect(evidenceAccount.timestamp.toNumber()).to.be.greaterThan(0);
      
      // Verify case evidence count incremented
      const caseAccountAfter = await program.account.case.fetch(casePda);
      expect(caseAccountAfter.evidenceCount).to.equal(evidenceId + 1);
    });

    it('should emit EvidenceAdded event', async () => {
      const caseAccountBefore = await program.account.case.fetch(casePda);
      const evidenceId = caseAccountBefore.evidenceCount;
      
      const [evidencePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('evidence'),
          Buffer.from(caseId),
          Buffer.from(new Uint32Array([evidenceId]).buffer)
        ],
        program.programId
      );
      
      let eventEmitted = false;
      let eventData: any = null;
      
      const listener = program.addEventListener('evidenceAdded', (event) => {
        eventEmitted = true;
        eventData = event;
      });
      
      try {
        await program.methods
          .addEvidence(
            { walletCluster: {} },
            Array.from(Buffer.alloc(32, 2)),
            'ipfs://event-test',
            'Event test evidence'
          )
          .accounts({
            case: casePda,
            evidence: evidencePda,
            submitter: submitter.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([submitter])
          .rpc();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        expect(eventEmitted).to.be.true;
        expect(eventData.caseId).to.equal(caseId);
        expect(eventData.evidenceId).to.equal(evidenceId);
        expect(JSON.stringify(eventData.evidenceType)).to.equal('{"walletCluster":{}}');
        expect(eventData.submitter.toBase58()).to.equal(submitter.publicKey.toBase58());
      } finally {
        await program.removeEventListener(listener);
      }
    });

    it('should support all evidence types', async () => {
      const evidenceTypes = [
        { type: { threatAlert: {} }, name: 'ThreatAlert' },
        { type: { report: {} }, name: 'Report' },
        { type: { external: {} }, name: 'External' }
      ];
      
      for (const evidenceType of evidenceTypes) {
        const caseAccount = await program.account.case.fetch(casePda);
        const evidenceId = caseAccount.evidenceCount;
        
        const [evidencePda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('evidence'),
            Buffer.from(caseId),
            Buffer.from(new Uint32Array([evidenceId]).buffer)
          ],
          program.programId
        );
        
        await program.methods
          .addEvidence(
            evidenceType.type,
            Array.from(Buffer.alloc(32, evidenceId)),
            `ipfs://test-${evidenceId}`,
            `Test evidence ${evidenceType.name}`
          )
          .accounts({
            case: casePda,
            evidence: evidencePda,
            submitter: submitter.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([submitter])
          .rpc();
        
        const evidenceAccount = await program.account.evidence.fetch(evidencePda);
        expect(evidenceAccount.evidenceId).to.equal(evidenceId);
      }
    });
  });

  describe('add_finding', () => {
    it('should add a finding to an open case', async () => {
      const finding = 'Critical finding: Suspicious transaction pattern detected';
      
      let eventEmitted = false;
      let eventData: any = null;
      
      const listener = program.addEventListener('findingRecorded', (event) => {
        eventEmitted = true;
        eventData = event;
      });
      
      try {
        await program.methods
          .addFinding(finding)
          .accounts({
            case: casePda,
            recorder: investigator.publicKey,
          })
          .signers([investigator])
          .rpc();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        expect(eventEmitted).to.be.true;
        expect(eventData.caseId).to.equal(caseId);
        expect(eventData.findingHash).to.be.an('array').with.lengthOf(32);
        expect(eventData.recorder.toBase58()).to.equal(investigator.publicKey.toBase58());
        expect(eventData.timestamp.toNumber()).to.be.greaterThan(0);
      } finally {
        await program.removeEventListener(listener);
      }
    });
  });

  describe('close_case', () => {
    it('should close case when called by investigator', async () => {
      const reportHash = Buffer.alloc(32, 99); // Final report hash
      
      let eventEmitted = false;
      let eventData: any = null;
      
      const listener = program.addEventListener('caseClosed', (event) => {
        eventEmitted = true;
        eventData = event;
      });
      
      try {
        const tx = await program.methods
          .closeCase(Array.from(reportHash))
          .accounts({
            case: casePda,
            investigator: investigator.publicKey,
          })
          .signers([investigator])
          .rpc();
        
        expect(tx).to.be.a('string');
        
        // Verify case is closed
        const caseAccount = await program.account.case.fetch(casePda);
        expect(JSON.stringify(caseAccount.status)).to.equal('{"closed":{}}');
        expect(caseAccount.reportHash).to.not.be.null;
        expect(Array.from(caseAccount.reportHash!)).to.deep.equal(Array.from(reportHash));
        
        // Verify event
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(eventEmitted).to.be.true;
        expect(eventData.caseId).to.equal(caseId);
        expect(Array.from(eventData.reportHash)).to.deep.equal(Array.from(reportHash));
      } finally {
        await program.removeEventListener(listener);
      }
    });

    it('should fail when unauthorized user tries to close case', async () => {
      // Create a new case for this test
      const newCaseId = 'CASE-UNAUTH-001';
      const [newCasePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('case'),
          Buffer.from(newCaseId),
          investigator.publicKey.toBuffer()
        ],
        program.programId
      );
      
      await program.methods
        .createCase(newCaseId, 'Unauthorized Test', 'Testing unauthorized close')
        .accounts({
          case: newCasePda,
          investigator: investigator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investigator])
        .rpc();
      
      // Try to close with unauthorized user
      try {
        await program.methods
          .closeCase(Array.from(Buffer.alloc(32, 1)))
          .accounts({
            case: newCasePda,
            investigator: unauthorizedUser.publicKey,
          })
          .signers([unauthorizedUser])
          .rpc();
        expect.fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).to.include('Unauthorized');
      }
    });
  });

  describe('error cases', () => {
    it('should fail to add evidence to closed case', async () => {
      // The casePda is already closed from previous test
      const caseAccount = await program.account.case.fetch(casePda);
      expect(JSON.stringify(caseAccount.status)).to.equal('{"closed":{}}');
      
      const evidenceId = caseAccount.evidenceCount;
      const [evidencePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('evidence'),
          Buffer.from(caseId),
          Buffer.from(new Uint32Array([evidenceId]).buffer)
        ],
        program.programId
      );
      
      try {
        await program.methods
          .addEvidence(
            { transactionTrace: {} },
            Array.from(Buffer.alloc(32, 1)),
            'ipfs://should-fail',
            'This should fail'
          )
          .accounts({
            case: casePda,
            evidence: evidencePda,
            submitter: submitter.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([submitter])
          .rpc();
        expect.fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).to.include('CaseClosed');
      }
    });

    it('should fail to add finding to closed case', async () => {
      try {
        await program.methods
          .addFinding('This should fail')
          .accounts({
            case: casePda,
            recorder: investigator.publicKey,
          })
          .signers([investigator])
          .rpc();
        expect.fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).to.include('CaseClosed');
      }
    });

    it('should fail when creating case with duplicate case_id for same investigator', async () => {
      // Try to create another case with the same ID (already created in first test)
      // This should succeed actually - the PDA would be the same and init would fail
      try {
        await program.methods
          .createCase(caseId, 'Duplicate', 'Should fail - account already exists')
          .accounts({
            case: casePda,
            investigator: investigator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([investigator])
          .rpc();
        expect.fail('Should have thrown an error');
      } catch (e: any) {
        // Expect an account already in use error
        expect(e.message).to.match(/(custom program error|account already exists|already in use)/i);
      }
    });
  });

  describe('case status transitions', () => {
    it('should track correct status throughout lifecycle', async () => {
      const lifecycleCaseId = 'CASE-LIFECYCLE-001';
      const [lifecycleCasePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('case'),
          Buffer.from(lifecycleCaseId),
          investigator.publicKey.toBuffer()
        ],
        program.programId
      );
      
      // 1. Create case - status should be Open
      await program.methods
        .createCase(lifecycleCaseId, 'Lifecycle Test', 'Testing status transitions')
        .accounts({
          case: lifecycleCasePda,
          investigator: investigator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([investigator])
        .rpc();
      
      let caseAccount = await program.account.case.fetch(lifecycleCasePda);
      expect(JSON.stringify(caseAccount.status)).to.equal('{"open":{}}');
      expect(caseAccount.evidenceCount).to.equal(0);
      
      // 2. Add evidence - status should remain Open
      const [evidencePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('evidence'),
          Buffer.from(lifecycleCaseId),
          Buffer.from(new Uint32Array([0]).buffer)
        ],
        program.programId
      );
      
      await program.methods
        .addEvidence(
          { report: {} },
          Array.from(Buffer.alloc(32, 1)),
          'ipfs://lifecycle-test',
          'Evidence before close'
        )
        .accounts({
          case: lifecycleCasePda,
          evidence: evidencePda,
          submitter: submitter.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([submitter])
        .rpc();
      
      caseAccount = await program.account.case.fetch(lifecycleCasePda);
      expect(JSON.stringify(caseAccount.status)).to.equal('{"open":{}}');
      expect(caseAccount.evidenceCount).to.equal(1);
      
      // 3. Close case - status should be Closed
      await program.methods
        .closeCase(Array.from(Buffer.alloc(32, 255)))
        .accounts({
          case: lifecycleCasePda,
          investigator: investigator.publicKey,
        })
        .signers([investigator])
        .rpc();
      
      caseAccount = await program.account.case.fetch(lifecycleCasePda);
      expect(JSON.stringify(caseAccount.status)).to.equal('{"closed":{}}');
      expect(caseAccount.reportHash).to.not.be.null;
    });
  });
});
