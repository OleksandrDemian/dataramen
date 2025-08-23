import crypto from 'node:crypto';
import {Env} from "../services/env";

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // AES-GCM standard

const getKey = (): Buffer => {
  const keyHex = Env.str("SYMM_ENCRYPTION_KEY");
  if (!keyHex) {
    throw new Error('Missing ENCRYPTION_KEY in environment variables.');
  }
  const keyBuffer = Buffer.from(keyHex, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (256 bits).');
  }
  return keyBuffer;
};

export type TEncryptedData = {
  encrypted: string;
  iv: string;
  tag: string;
};

const encrypt = (plaintext: string): TEncryptedData => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
};

const decrypt = ({ encrypted, iv, tag }: TEncryptedData): string => {
  // todo: cache in memory decrypted values? (ex: for 5 minutes)
  const key = getKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

export const SymmEncryptionUtils = {
  encrypt: encrypt,
  decrypt: decrypt,
};
