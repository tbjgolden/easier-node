import { isEscaped } from "./json.helpers";

export type JSONPrimitive = string | number | boolean | null;

/** Deliberately does not allow primitives at the top level */
export type JSONData =
  | {
      [key: string]: JSONData | JSONPrimitive;
    }
  | Array<JSONData | JSONPrimitive>;

/**
 * same as JSON.parse, but reads comments
 * @example
 * // returns { "unicorn": "cake" }
 * readJSON(`{
 *   // Rainbows
 *   "unicorn": "cake"
 * }`)
 * */
export const readJSON = <T = unknown>(jsonString: string): T => {
  return JSON.parse(removeJSONComments(jsonString));
};

/**
 * same as JSON.stringify
 * @example
 * // returns "{\"unicorn\":\"cake\"}"
 * writeJSON({
 *   // Rainbows
 *   "unicorn": "cake"
 * })
 * */
export const writeJSON = <T extends JSONData>(jsonString: T): string => {
  return JSON.stringify(jsonString);
};

/**
 * same as removeJSONComments from a JSON string
 * some JSON config files allow comments
 *
 * @example
 * // returns "html, body, div, span, [...]"
 * await removeJSONComments(`{
 *   // Rainbows
 *   "unicorn": "cake"
 * }`)
 * */
export const removeJSONComments = (jsonString: string): string => {
  let isInsideString = false;
  let isInsideComment: 0 | 1 | 2 = 0;
  let offset = 0;
  let result = "";

  for (let index = 0; index < jsonString.length; index += 1) {
    const currentCharacter = jsonString[index];
    const nextCharacter = jsonString[index + 1];

    if (!isInsideComment && currentCharacter === '"' && !isEscaped(jsonString, index)) {
      isInsideString = !isInsideString;
    }

    if (isInsideString) {
      continue;
    }

    if (!isInsideComment && currentCharacter + nextCharacter === "//") {
      result += jsonString.slice(offset, index);
      offset = index;
      isInsideComment = 1;
      index += 1;
    } else if (isInsideComment === 1 && currentCharacter + nextCharacter === "\r\n") {
      index += 1;
      isInsideComment = 0;
      result = String(result);
      offset = index;
      continue;
    } else if (isInsideComment === 1 && currentCharacter === "\n") {
      isInsideComment = 0;
      result = String(result);
      offset = index;
    } else if (!isInsideComment && currentCharacter + nextCharacter === "/*") {
      result += jsonString.slice(offset, index);
      offset = index;
      isInsideComment = 2;
      index += 1;
      continue;
    } else if (isInsideComment === 2 && currentCharacter + nextCharacter === "*/") {
      index += 1;
      isInsideComment = 0;
      result = String(result);
      offset = index + 1;
      continue;
    }
  }

  return result + (isInsideComment ? "" : jsonString.slice(offset));
};
