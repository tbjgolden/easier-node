import crypto from "node:crypto";

export const uuidv4 = () => {
  return crypto.randomUUID();
};
