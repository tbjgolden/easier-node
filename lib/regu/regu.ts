const ESCAPE_REGEX = /[\t\n$()*+.?[\\\]^{|}]/g;
const replacer = (value: string): string => {
  if (value === "\n") {
    return "\\n";
  }
  if (value === "\t") {
    return "\\t";
  }
  return "\\" + value;
};

export const escape = (string: string): string => {
  return string.replace(ESCAPE_REGEX, replacer);
};
