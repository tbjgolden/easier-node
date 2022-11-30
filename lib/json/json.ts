import { isThisCharEscaped } from "../stri/stri";

export type JSONPrimitive = string | number | boolean | null;
export type JSONData =
  | {
      [key: string]: JSONData | JSONPrimitive;
    }
  | Array<JSONData | JSONPrimitive>;

export const parse = <T = unknown>(jsonString: string): T => {
  return JSON.parse(stripComments(jsonString));
};

export const stringify = <T extends JSONData>(jsonString: T): string => {
  return JSON.stringify(jsonString);
};

export const stripComments = (jsonString: string): string => {
  let isInsideString = false;
  let isInsideComment: 0 | 1 | 2 = 0;
  let offset = 0;
  let result = "";

  for (let index = 0; index < jsonString.length; index += 1) {
    const currentCharacter = jsonString[index];
    const nextCharacter = jsonString[index + 1];

    if (
      !isInsideComment &&
      currentCharacter === '"' &&
      !isThisCharEscaped(jsonString, index)
    ) {
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
