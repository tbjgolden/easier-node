import { createHash } from "node:crypto";

/**
 * create a fast hex for non cryptographic use (sha1)
 * */
export const hashFastHex = async (input: string | Buffer): Promise<string> => {
  return createHash("sha1").update(input).digest("hex");
};

/**
 * create a secure hex for cryptographic use (sha256)
 * */
export const hashSecureHex = async (input: string | Buffer): Promise<string> => {
  return createHash("sha256").update(input).digest("hex");
};
