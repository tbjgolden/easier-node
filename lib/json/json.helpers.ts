export const isEscaped = (jsonString: string, quotePosition: number): boolean => {
  let index = quotePosition - 1;
  let backslashCount = 0;

  while (jsonString[index] === "\\") {
    index -= 1;
    backslashCount += 1;
  }

  return backslashCount % 2 === 1;
};
