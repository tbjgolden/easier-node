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

    if (isInsideString) continue;

    if (!isInsideComment && currentCharacter + nextCharacter === "//") {
      result += jsonString.slice(offset, index);
      offset = index;
      isInsideComment = 1;
      index += 1;
    } else if (isInsideComment === 1 && currentCharacter + nextCharacter === "\r\n") {
      index += 1;
      isInsideComment = 0;
      result += "";
      offset = index;
      continue;
    } else if (isInsideComment === 1 && currentCharacter === "\n") {
      isInsideComment = 0;
      result += "";
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
      result += "";
      offset = index + 1;
      continue;
    }
  }

  return result + (isInsideComment ? "" : jsonString.slice(offset));
};

const isEscaped = (jsonString: string, quotePosition: number): boolean => {
  let index = quotePosition - 1;
  let backslashCount = 0;

  while (jsonString[index] === "\\") {
    index -= 1;
    backslashCount += 1;
  }

  return backslashCount % 2 === 1;
};
