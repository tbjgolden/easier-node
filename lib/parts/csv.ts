import {
  doesCSVValueRequireQuotes,
  // , getLastLineFromPartialCSV
} from "./csv.helpers";
// import { getFirstNBytes } from "./filesystem.helpers";
// export { parseCSV } from "./csv.helpers";

/**
 * If a CSV value needs to be quoted, this function will add quotes
 * and escape any quotes that already exist.
 */
export const escapeCSVValue = (value: string): string => {
  return doesCSVValueRequireQuotes(value)
    ? '"' + value.replaceAll('"', '""') + '"'
    : value;
};

// export const getHeaderRow = async (path: string): string[] => {
//   for (let byteCount = 1024; byteCount <= 1_048_576; byteCount = byteCount + byteCount) {
//     const firstBytes = await getFirstNBytes(path, byteCount);
//     const firstString = Buffer.from(firstBytes).toString("utf8");
//     console.log(firstString);
//   }
// };
