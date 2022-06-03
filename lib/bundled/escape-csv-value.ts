/**
 * If a CSV value needs to be quoted, this function will add quotes
 * and escape any quotes that already exist.
 */
export const escapeCSVValue = (value: string): string => {
  return _doesCSVValueRequireQuotes(value)
    ? '"' + value.replaceAll('"', '""') + '"'
    : value;
};

const NO_ESCAPE_NEEDED_REGEX = /^[^\s",]([^\n\r",]*[^\s",])?$|^$/;

/**
 * Checks if a CSV value needs to be quoted. Used by escapeCSVValue()
 */
export const _doesCSVValueRequireQuotes = (value: string): boolean => {
  return !NO_ESCAPE_NEEDED_REGEX.test(value);
};
