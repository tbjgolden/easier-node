/* ! Adapted from https://mths.be/esrever v0.2.0 by @mathias */

import { inspect, InspectOptions } from "node:util";

const regexSymbolWithCombiningMarks =
  // eslint-disable-next-line no-misleading-character-class
  /([\0-\u02FF\u0370-\u1AAF\u1B00-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uE000-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])([\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+)/g;
const regexSurrogatePair = /([\uD800-\uDBFF])([\uDC00-\uDFFF])/g;

/**
 * reverseString - reverse a string (reversing combination chars correctly)
 */
export const reverseString = (string: string): string => {
  string = string
    .replace(regexSymbolWithCombiningMarks, (_, $1, $2) => {
      return reverseString($2) + $1;
    })
    .replace(regexSurrogatePair, "$2$1");

  const result = [];
  let index = string.length;
  while (index--) {
    result.push(string.charAt(index));
  }
  return result.join("");
};

export const toUTF8String = (
  input: WithImplicitCoercion<Buffer | ArrayBuffer | SharedArrayBuffer>
): string => {
  const buffer = input instanceof Buffer ? input : Buffer.from(input);
  return buffer.toString("utf8");
};

const toBuffer = (
  input: WithImplicitCoercion<string | Buffer | ArrayBuffer | SharedArrayBuffer>
): Buffer => {
  const value: Buffer | ArrayBuffer | SharedArrayBuffer | string =
    typeof input === "object"
      ? (input.valueOf() as ArrayBuffer | SharedArrayBuffer | string)
      : input;

  let buffer: Buffer;
  if (value instanceof Buffer) {
    buffer = value;
  } else if (typeof value === "string") {
    buffer = Buffer.from(value);
  } else {
    buffer = Buffer.from(value);
  }
  return buffer;
};

export const toBase64String = (
  input: WithImplicitCoercion<string | Buffer | ArrayBuffer | SharedArrayBuffer>
): string => {
  return toBuffer(input).toString("base64");
};
export const toBase64URLString = (
  input: WithImplicitCoercion<string | Buffer | ArrayBuffer | SharedArrayBuffer>
): string => {
  return toBuffer(input).toString("base64url");
};
export const toHexString = (
  input: WithImplicitCoercion<string | Buffer | ArrayBuffer | SharedArrayBuffer>
): string => {
  return toBuffer(input).toString("hex");
};
export const fromBase64String = (string: string): string => {
  return Buffer.from(string, "base64").toString();
};
export const fromBase64URLString = (string: string): string => {
  return Buffer.from(string, "base64url").toString();
};
export const fromHexString = (string: string): string => {
  return Buffer.from(string, "hex").toString();
};

export const toPrettyString = (input: unknown, options?: InspectOptions): string => {
  return inspect(input, {
    depth: 10,
    maxArrayLength: 125,
    sorted: true,
    ...options,
  });
};
export const print = (...input: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.log(
    input
      .map((argument) => {
        return toPrettyString(argument);
      })
      .join(" ")
  );
};
