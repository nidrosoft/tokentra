/**
 * Credential Vault - AES-256-GCM Encryption for Provider Credentials
 * 
 * Handles secure encryption and decryption of provider API keys and credentials.
 * Uses AES-256-GCM for authenticated encryption.
 */

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export class CredentialVault {
  private encryptionKey: Buffer;

  constructor(encryptionKeyHex?: string) {
    const keySource = encryptionKeyHex || process.env.PROVIDER_ENCRYPTION_KEY || '';
    
    if (!keySource) {
      throw new Error('Encryption key is required. Set PROVIDER_ENCRYPTION_KEY environment variable.');
    }
    
    // Derive a 256-bit key from the provided key
    this.encryptionKey = crypto
      .createHash('sha256')
      .update(keySource)
      .digest();
  }

  /**
   * Encrypt credentials for secure storage
   */
  async encrypt(credentials: Record<string, unknown>): Promise<string> {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);
    
    const plaintext = JSON.stringify(credentials);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine: iv (16 bytes) + tag (16 bytes) + ciphertext
    const combined = Buffer.concat([
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
  }

  /**
   * Decrypt credentials from storage
   */
  async decrypt<T = Record<string, unknown>>(encryptedData: string): Promise<T> {
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted) as T;
  }

  /**
   * Rotate encryption key - re-encrypt data with new key
   */
  async rotateKey(
    oldKeyHex: string,
    newKeyHex: string,
    encryptedData: string
  ): Promise<string> {
    // Create temporary vault with old key
    const oldVault = new CredentialVault(oldKeyHex);
    const credentials = await oldVault.decrypt(encryptedData);
    
    // Update this vault's key
    this.encryptionKey = crypto
      .createHash('sha256')
      .update(newKeyHex)
      .digest();
    
    // Re-encrypt with new key
    return this.encrypt(credentials);
  }

  /**
   * Mask sensitive credential fields for display
   */
  static maskCredentials(credentials: Record<string, unknown>): Record<string, unknown> {
    const masked: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(credentials)) {
      if (typeof value === 'string') {
        // Mask API keys and secrets
        if (
          key.toLowerCase().includes('key') ||
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('password')
        ) {
          if (value.length > 8) {
            masked[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
          } else {
            masked[key] = '****';
          }
        } else if (key === 'serviceAccountKey') {
          // For service account JSON, just indicate it's present
          masked[key] = '[SERVICE_ACCOUNT_JSON]';
        } else {
          masked[key] = value;
        }
      } else {
        masked[key] = value;
      }
    }
    
    return masked;
  }
}

// Singleton instance for convenience
let vaultInstance: CredentialVault | null = null;

export function getCredentialVault(): CredentialVault {
  if (!vaultInstance) {
    vaultInstance = new CredentialVault();
  }
  return vaultInstance;
}
