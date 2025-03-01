use anchor_lang::prelude::*;

declare_id!("FWdr24EeADgVuRE1Bqg8YEKNkL6sjTP5CATLc4TNr7DA");

#[program]
pub mod document_storage {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let user_documents = &mut ctx.accounts.user_documents;
        user_documents.owner = ctx.accounts.user.key();
        user_documents.document_count = 0;
        
        msg!("User document storage initialized");
        Ok(())
    }
    
    pub fn add_document(
        ctx: Context<AddDocument>,
        file_name: String,
        file_type: String,
        encrypted_cid: String,
        iv: String,
    ) -> Result<()> {
        // Validate input lengths
        require!(file_name.len() <= 100, DocumentError::InvalidFileName);
        require!(file_type.len() <= 50, DocumentError::InvalidFileType);
        require!(encrypted_cid.len() <= 100, DocumentError::InvalidCID);
        require!(iv.len() <= 50, DocumentError::InvalidIV);
        
        let user_documents = &mut ctx.accounts.user_documents;
        let document = &mut ctx.accounts.document;
        
        // Initialize document
        document.owner = ctx.accounts.user.key();
        document.file_name = file_name;
        document.file_type = file_type;
        document.encrypted_cid = encrypted_cid;
        document.iv = iv;
        document.created_at = Clock::get()?.unix_timestamp;
        document.shared_with = Vec::new();
        
        // Update document count
        user_documents.document_count = user_documents.document_count.checked_add(1)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        
        msg!("Document added successfully");
        Ok(())
    }

    pub fn share_document(
        ctx: Context<ShareDocument>,
        encrypted_cid_for_recipient: String,
        iv_for_recipient: String,
    ) -> Result<()> {
        let document = &mut ctx.accounts.document;
        
        // Validate owner
        require!(document.owner == ctx.accounts.sharer.key(), DocumentError::NotDocumentOwner);
        
        // Check if already shared
        let recipient_key = ctx.accounts.recipient.key();
        require!(
            !document.shared_with.iter().any(|shared| shared.recipient == recipient_key),
            DocumentError::AlreadySharedWithRecipient
        );
        
        // Add recipient to shared list
        document.shared_with.push(SharedWith {
            recipient: recipient_key,
            encrypted_cid: encrypted_cid_for_recipient,
            iv: iv_for_recipient,
            shared_at: Clock::get()?.unix_timestamp,
        });
        
        msg!("Document shared successfully");
        Ok(())
    }

    pub fn revoke_access(ctx: Context<RevokeAccess>) -> Result<()> {
        let document = &mut ctx.accounts.document;
        let owner_key = ctx.accounts.owner.key();
        let recipient_key = ctx.accounts.recipient.key();
        
        // Validate owner
        require!(document.owner == owner_key, DocumentError::NotDocumentOwner);
        
        // Find the index of the recipient to remove
        let recipient_index = document.shared_with
            .iter()
            .position(|shared| shared.recipient == recipient_key)
            .ok_or(DocumentError::RecipientNotFound)?;
        
        // Remove recipient from the shared_with list
        document.shared_with.remove(recipient_index);
        
        msg!("Access revoked successfully for recipient");
        Ok(())
    }

    pub fn close_document(ctx: Context<CloseDocument>) -> Result<()> {
        let user_documents = &mut ctx.accounts.user_documents;
        
        // Safely decrement document count
        user_documents.document_count = user_documents.document_count.saturating_sub(1);
        
        // When account is closed using the close constraint,
        // Solana will automatically remove all the data
        
        msg!("Document closed and completely removed including all shared access");
        Ok(())
    }
}

#[account]
pub struct UserDocuments {
    pub owner: Pubkey,
    pub document_count: u64,
}

#[account]
pub struct Document {
    pub owner: Pubkey,
    pub file_name: String,
    pub file_type: String,
    pub encrypted_cid: String,
    pub iv: String,
    pub created_at: i64,
    pub shared_with: Vec<SharedWith>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SharedWith {
    pub recipient: Pubkey,
    pub encrypted_cid: String,
    pub iv: String,
    pub shared_at: i64,
}

#[error_code]
pub enum DocumentError {
    #[msg("Not the document owner")]
    NotDocumentOwner,
    #[msg("Document already shared with this recipient")]
    AlreadySharedWithRecipient,
    #[msg("Invalid file name length")]
    InvalidFileName,
    #[msg("Invalid file type length")]
    InvalidFileType,
    #[msg("Invalid CID length")]
    InvalidCID,
    #[msg("Invalid IV length")]
    InvalidIV,
    #[msg("Recipient not found in shared list")]
    RecipientNotFound,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 32 + 8,
        seeds = [b"user_documents", user.key().as_ref()],
        bump
    )]
    pub user_documents: Account<'info, UserDocuments>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(file_name: String, file_type: String, encrypted_cid: String, iv: String)]
pub struct AddDocument<'info> {
    #[account(
        mut,
        seeds = [b"user_documents", user.key().as_ref()],
        bump,
        has_one = owner @ DocumentError::NotDocumentOwner
    )]
    pub user_documents: Account<'info, UserDocuments>,
    
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 4 + file_name.len() + 4 + file_type.len() + 
               4 + encrypted_cid.len() + 4 + iv.len() + 8 + 4 + 500,
        seeds = [b"document", user.key().as_ref(), file_name.as_bytes()],
        bump
    )]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// CHECK: This is the owner of user documents, verified in constraint above
    pub owner: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ShareDocument<'info> {
    #[account(mut)]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub sharer: Signer<'info>,
    
    /// CHECK: Recipient's public key
    pub recipient: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    #[account(mut)]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// CHECK: Recipient's public key to revoke access from
    pub recipient: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CloseDocument<'info> {
    #[account(
        mut,
        seeds = [b"user_documents", user.key().as_ref()],
        bump,
        has_one = owner @ DocumentError::NotDocumentOwner
    )]
    pub user_documents: Account<'info, UserDocuments>,
    
    #[account(
        mut,
        close = user,
        constraint = document.owner == user.key() @ DocumentError::NotDocumentOwner,
        seeds = [b"document", user.key().as_ref(), document.file_name.as_bytes()],
        bump
    )]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// CHECK: This is the user documents owner, verified in constraint above
    pub owner: UncheckedAccount<'info>,
}