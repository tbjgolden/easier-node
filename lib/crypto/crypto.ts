import { createHash } from "node:crypto";

import xxhash_, { XXHashAPI } from "xxhash-wasm";

// to ensure wasm is only compiled once
let cachedxxhash: XXHashAPI | undefined;
const getXXHash = async (): Promise<XXHashAPI> => {
  if (cachedxxhash === undefined) {
    const xxh_ = await xxhash_();
    cachedxxhash = xxh_;
    return xxh_;
  } else {
    return cachedxxhash;
  }
};

/**
 * create a fast hex for non cryptographic use
 *
 * uses 64 bit xxhash - any algorithm change would result in a new major lib version
 * */
export const hashFastHex = async (input: string | Buffer): Promise<string> => {
  const xxhash = await getXXHash();
  const buffer: Buffer = input instanceof Buffer ? input : Buffer.from(input);
  return xxhash.h64Raw(buffer).toString(16);
};

/**
 * create a secure hex for cryptographic use
 *
 * uses sha256 - any algorithm change would result in a new major lib version
 * */
export const hashSecureHex = async (input: string | Buffer): Promise<string> => {
  return createHash("sha256").update(input).digest("hex");
};
