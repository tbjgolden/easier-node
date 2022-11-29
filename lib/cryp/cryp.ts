import { createHash } from "node:crypto";

export const toHashHexFast = async (input: string | Buffer): Promise<string> => {
  return createHash("sha1").update(input).digest("hex");
};

export const toHashHexSecure = async (input: string | Buffer): Promise<string> => {
  return createHash("sha256").update(input).digest("hex");
};
