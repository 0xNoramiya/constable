import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, Connection } from '@solana/web3.js';

// IDL would be generated from the Rust program
export interface EvidenceVaultIDL {
  version: string;
  name: string;
  // ... full IDL structure
}

export interface Case {
  investigator: PublicKey;
  caseId: string;
  title: string;
  description: string;
  status: 'Open' | 'Closed' | 'Archived';
  evidenceCount: number;
  reportHash: Uint8Array | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Evidence {
  caseId: string;
  evidenceId: number;
  evidenceType: EvidenceType;
  dataHash: Uint8Array;
  metadataUri: string;
  description: string;
  submitter: PublicKey;
  timestamp: Date;
}

export type EvidenceType = 
  | 'TransactionTrace' 
  | 'WalletCluster' 
  | 'ThreatAlert' 
  | 'Report' 
  | 'External';

export class ConstableSDK {
  private program: Program<any>;
  private connection: Connection;

  constructor(
    connection: Connection,
    wallet: anchor.Wallet,
    programId?: PublicKey
  ) {
    this.connection = connection;
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);
    
    // Program ID from deployment
    const pid = programId || new PublicKey('Fg6tVimZ4BRL1P8dWNFxDGWKdfnw3hH7VzMBz5v4RZJx');
    // Program would be loaded from IDL
    this.program = new Program({} as any, pid, provider);
  }

  /**
   * Create a new investigation case
   */
  async createCase(
    caseId: string,
    title: string,
    description: string
  ): Promise<string> {
    const investigator = this.program.provider.publicKey;
    
    const [casePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('case'),
        Buffer.from(caseId),
        investigator.toBuffer()
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .createCase(caseId, title, description)
      .accounts({
        case: casePda,
        investigator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Add evidence to a case
   */
  async addEvidence(
    caseId: string,
    investigator: PublicKey,
    evidenceType: EvidenceType,
    dataHash: Uint8Array,
    metadataUri: string,
    description: string
  ): Promise<string> {
    const submitter = this.program.provider.publicKey;
    
    const [casePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('case'),
        Buffer.from(caseId),
        investigator.toBuffer()
      ],
      this.program.programId
    );

    // Get case to determine evidence ID
    const caseAccount = await this.program.account.case.fetch(casePda);
    const evidenceId = caseAccount.evidenceCount;

    const [evidencePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('evidence'),
        Buffer.from(caseId),
        Buffer.from(new Uint32Array([evidenceId]).buffer)
      ],
      this.program.programId
    );

    const evidenceTypeMap: Record<EvidenceType, number> = {
      'TransactionTrace': 0,
      'WalletCluster': 1,
      'ThreatAlert': 2,
      'Report': 3,
      'External': 4
    };

    const tx = await this.program.methods
      .addEvidence(
        evidenceTypeMap[evidenceType],
        Array.from(dataHash),
        metadataUri,
        description
      )
      .accounts({
        case: casePda,
        evidence: evidencePda,
        submitter,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Close a case and store final report hash
   */
  async closeCase(
    caseId: string,
    reportHash: Uint8Array
  ): Promise<string> {
    const investigator = this.program.provider.publicKey;
    
    const [casePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('case'),
        Buffer.from(caseId),
        investigator.toBuffer()
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .closeCase(Array.from(reportHash))
      .accounts({
        case: casePda,
        investigator,
      })
      .rpc();

    return tx;
  }

  /**
   * Fetch case details
   */
  async getCase(casePda: PublicKey): Promise<Case> {
    const account = await this.program.account.case.fetch(casePda);
    return {
      investigator: account.investigator,
      caseId: account.caseId,
      title: account.title,
      description: account.description,
      status: ['Open', 'Closed', 'Archived'][account.status] as Case['status'],
      evidenceCount: account.evidenceCount,
      reportHash: account.reportHash,
      createdAt: new Date(account.createdAt * 1000),
      updatedAt: new Date(account.updatedAt * 1000),
    };
  }

  /**
   * Fetch all cases for an investigator
   */
  async getCasesByInvestigator(investigator: PublicKey): Promise<PublicKey[]> {
    const accounts = await this.connection.getProgramAccounts(
      this.program.programId,
      {
        filters: [
          {
            memcmp: {
              offset: 8, // After discriminator
              bytes: investigator.toBase58()
            }
          }
        ]
      }
    );
    return accounts.map(a => a.pubkey);
  }

  /**
   * Get case PDA address
   */
  getCasePda(caseId: string, investigator: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('case'),
        Buffer.from(caseId),
        investigator.toBuffer()
      ],
      this.program.programId
    );
    return pda;
  }
}

export default ConstableSDK;
