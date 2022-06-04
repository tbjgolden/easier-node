import {
  doesCSVValueRequireQuotes,
  getFirstNEntriesFromPartialCSV,
  getLastNEntriesFromPartialCSV,
  ParseOptions,
} from "./csv.helpers";
import { getFirstNBytes, getLastNBytes } from "./filesystem.helpers";
export { parseCSV } from "./csv.helpers";

/**
 * If a CSV value needs to be quoted, this function will add quotes
 * and escape any quotes that already exist.
 */
export const escapeCSVValue = (value: string): string => {
  return doesCSVValueRequireQuotes(value)
    ? '"' + value.replaceAll('"', '""') + '"'
    : value;
};

/**
 * Gets the first non-empty row of a CSV file without needing to look at the whole file
 */
export const getFirstCSVFileRow = async (
  path: string,
  parseOptions: Partial<Omit<ParseOptions, "returnOnFail">> = {}
) => {
  for (let byteCount = 4096; byteCount <= 262_144; byteCount = byteCount + byteCount) {
    const firstBytes = await getFirstNBytes(path, byteCount);
    const firstString = Buffer.from(firstBytes).toString("utf8");
    const firstEntry = getFirstNEntriesFromPartialCSV(firstString, 1, parseOptions);
    if (firstEntry !== "incomplete") {
      return firstEntry[0];
    }
  }
  throw new Error("Could not parse first row");
};

/**
 * Gets the last non-empty row of a CSV file without needing to look at the whole file
 */
export const getLastCSVFileRow = async (
  path: string,
  parseOptions: Partial<Omit<ParseOptions, "returnOnFail">> = {}
) => {
  for (let byteCount = 4096; byteCount <= 262_144; byteCount = byteCount + byteCount) {
    const lastBytes = await getLastNBytes(path, byteCount);
    const lastString = Buffer.from(lastBytes).toString("utf8");
    const lastEntry = getLastNEntriesFromPartialCSV(lastString, 1, parseOptions);
    if (lastEntry !== "incomplete") {
      return lastEntry[0];
    }
  }
  throw new Error("Could not parse last row");
};
