/*! Adapted from https://mths.be/esrever v0.2.0 by @mathias */

const regexSymbolWithCombiningMarks =
  // eslint-disable-next-line no-misleading-character-class
  /([\0-\u02FF\u0370-\u1AAF\u1B00-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uE000-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])([\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+)/g;
const regexSurrogatePair = /([\uD800-\uDBFF])([\uDC00-\uDFFF])/g;

export const reverseSafe = (stringToReverse: string): string => {
  stringToReverse = stringToReverse
    .replace(regexSymbolWithCombiningMarks, (_, $1, $2) => {
      return reverseSafe($2) + $1;
    })
    .replace(regexSurrogatePair, "$2$1");

  const result = [];
  let index = stringToReverse.length;
  while (index--) {
    result.push(stringToReverse.charAt(index));
  }
  return result.join("");
};
