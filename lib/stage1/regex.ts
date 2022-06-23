const ESCAPE_REGEX = /[\t\n$()*+.?[\\\]^{|}]/g;
const replacer = (value: string): string => {
  if (value === "\n") return "\\n";
  if (value === "\t") return "\\t";
  return "\\" + value;
};

/**
 * Escapes a string for use within a regex, escaping special characters
 * like * to behave like a literal '*' character instead of its regex behaviour
 *
 * Escapes: \t \n $ ( ) * + . ? [ \ ] ^ { | }
 * */
export const escapeStringForRegex = (string: string): string => {
  return string.replace(ESCAPE_REGEX, replacer);
};
