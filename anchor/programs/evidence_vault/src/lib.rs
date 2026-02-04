use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

// Evidence Vault - On-chain forensic evidence storage
// Each investigation is a "Case" with multiple pieces of "Evidence"

declare_id!("Fg6tVimZ4BRL1P8dWNFxDGWKdfnw3hH7VzMBz5v4RZJx");

#[program]
pub mod evidence_vault {
    use super::*;

    /// Initialize a new investigation case
    pub fn create_case(
        ctx: Context<CreateCase>,
        case_id: String,
        title: String,
        description: String,
    ) -> Result<()> {
        let case = &mut ctx.accounts.case;
        case.investigator = ctx.accounts.investigator.key();
        case.case_id = case_id.clone();
        case.title = title;
        case.description = description;
        case.status = CaseStatus::Open;
        case.evidence_count = 0;
        case.created_at = Clock::get()?.unix_timestamp;
        case.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(CaseCreated {
            case_id,
            investigator: ctx.accounts.investigator.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// Add evidence to a case
    pub fn add_evidence(
        ctx: Context<AddEvidence>,
        evidence_type: EvidenceType,
        data_hash: [u8; 32],
        metadata_uri: String,
        description: String,
    ) -> Result<()> {
        let case = &mut ctx.accounts.case;
        let evidence = &mut ctx.accounts.evidence;
        
        require!(
            case.status == CaseStatus::Open,
            ForensicError::CaseClosed
        );
        
        evidence.case_id = case.case_id.clone();
        evidence.evidence_id = case.evidence_count;
        evidence.evidence_type = evidence_type;
        evidence.data_hash = data_hash;
        evidence.metadata_uri = metadata_uri;
        evidence.description = description;
        evidence.submitter = ctx.accounts.submitter.key();
        evidence.timestamp = Clock::get()?.unix_timestamp;
        
        case.evidence_count += 1;
        case.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(EvidenceAdded {
            case_id: case.case_id.clone(),
            evidence_id: evidence.evidence_id,
            evidence_type,
            submitter: ctx.accounts.submitter.key(),
            timestamp: evidence.timestamp,
        });
        
        Ok(())
    }

    /// Close a case and generate final report hash
    pub fn close_case(
        ctx: Context<CloseCase>,
        report_hash: [u8; 32],
    ) -> Result<()> {
        let case = &mut ctx.accounts.case;
        
        require!(
            case.investigator == ctx.accounts.investigator.key(),
            ForensicError::Unauthorized
        );
        
        case.status = CaseStatus::Closed;
        case.report_hash = Some(report_hash);
        case.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(CaseClosed {
            case_id: case.case_id.clone(),
            report_hash,
            timestamp: case.updated_at,
        });
        
        Ok(())
    }

    /// Add a finding/memo to the case (immutable audit trail)
    pub fn add_finding(
        ctx: Context<AddFinding>,
        finding: String,
    ) -> Result<()> {
        let case = &mut ctx.accounts.case;
        
        require!(
            case.status == CaseStatus::Open,
            ForensicError::CaseClosed
        );
        
        emit!(FindingRecorded {
            case_id: case.case_id.clone(),
            finding_hash: hash(finding.as_bytes()).to_bytes(),
            recorder: ctx.accounts.recorder.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(case_id: String)]
pub struct CreateCase<'a, 'b> {
    #[account(
        init,
        payer = investigator,
        space = 8 + Case::SIZE,
        seeds = [b"case", case_id.as_bytes(), investigator.key().as_ref()],
        bump
    )]
    pub case: Account<'a, Case>,
    
    #[account(mut)]
    pub investigator: Signer<'a, 'b>,
    
    pub system_program: Program<'a, System>,
}

#[derive(Accounts)]
pub struct AddEvidence<'a, 'b> {
    #[account(mut)]
    pub case: Account<'a, Case>,
    
    #[account(
        init,
        payer = submitter,
        space = 8 + Evidence::SIZE,
        seeds = [
            b"evidence",
            case.case_id.as_bytes(),
            &case.evidence_count.to_le_bytes()
        ],
        bump
    )]
    pub evidence: Account<'a, Evidence>,
    
    #[account(mut)]
    pub submitter: Signer<'a, 'b>,
    
    pub system_program: Program<'a, System>,
}

#[derive(Accounts)]
pub struct CloseCase<'a, 'b> {
    #[account(mut)]
    pub case: Account<'a, Case>,
    
    pub investigator: Signer<'a, 'b>,
}

#[derive(Accounts)]
pub struct AddFinding<'a, 'b> {
    #[account(mut)]
    pub case: Account<'a, Case>,
    
    pub recorder: Signer<'a, 'b>,
}

#[account]
pub struct Case {
    pub investigator: Pubkey,
    pub case_id: String,        // Max 32 chars
    pub title: String,          // Max 64 chars
    pub description: String,    // Max 256 chars
    pub status: CaseStatus,
    pub evidence_count: u32,
    pub report_hash: Option<[u8; 32]>,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Case {
    pub const SIZE: usize = 32 + // investigator
        4 + 32 +    // case_id (String overhead + max)
        4 + 64 +    // title
        4 + 256 +   // description
        1 +         // status
        4 +         // evidence_count
        1 + 32 +    // report_hash (Option + hash)
        8 + 8;      // timestamps
}

#[account]
pub struct Evidence {
    pub case_id: String,        // Reference to parent case
    pub evidence_id: u32,       // Sequential within case
    pub evidence_type: EvidenceType,
    pub data_hash: [u8; 32],    // SHA-256 hash of evidence data
    pub metadata_uri: String,   // IPFS/Arweave link (max 128 chars)
    pub description: String,    // Max 256 chars
    pub submitter: Pubkey,
    pub timestamp: i64,
}

impl Evidence {
    pub const SIZE: usize = 4 + 32 +    // case_id
        4 +         // evidence_id
        1 +         // evidence_type
        32 +        // data_hash
        4 + 128 +   // metadata_uri
        4 + 256 +   // description
        32 +        // submitter
        8;          // timestamp
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum CaseStatus {
    Open,
    Closed,
    Archived,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum EvidenceType {
    TransactionTrace,    // Transaction flow analysis
    WalletCluster,       // Cluster analysis results
    ThreatAlert,         // Suspicious activity alert
    Report,              // Investigation report
    External,            // External data reference
}

#[error_code]
pub enum ForensicError {
    #[msg("Case is closed and cannot be modified")]
    CaseClosed,
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Invalid evidence type")]
    InvalidEvidenceType,
}

// Events
#[event]
pub struct CaseCreated {
    pub case_id: String,
    pub investigator: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct EvidenceAdded {
    pub case_id: String,
    pub evidence_id: u32,
    pub evidence_type: EvidenceType,
    pub submitter: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct CaseClosed {
    pub case_id: String,
    pub report_hash: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct FindingRecorded {
    pub case_id: String,
    pub finding_hash: [u8; 32],
    pub recorder: Pubkey,
    pub timestamp: i64,
}
