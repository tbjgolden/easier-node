import { appendFile } from "../filesystem/filesystem";
import { getFirstNBytes, getLastNBytes } from "../filesystem/filesystem.helpers";
import {
  doesCSVValueRequireQuotes,
  getFirstNEntriesFromPartialCSV,
  getLastNEntriesFromPartialCSV,
  ParseOptions,
} from "./csv.helpers";
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
    const firstEntry = getFirstNEntriesFromPartialCSV(firstString, 1, {
      ...parseOptions,
      isPartial: firstBytes.length === byteCount,
    });
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
    const lastEntry = getLastNEntriesFromPartialCSV(lastString, 1, {
      ...parseOptions,
      isPartial: lastBytes.length === byteCount,
    });
    if (lastEntry !== "incomplete") {
      return lastEntry[0];
    }
  }
  throw new Error("Could not parse last row");
};

/**
 * Append to CSV file by passing an object, with keys as header names and values as
 * primitives; without needing to look at the whole file
 */
export const appendEntryToCSVFile = async <
  T extends Record<string, string | number | boolean | undefined>
>(
  path: string,
  object: T,
  parseOptions: Partial<Omit<ParseOptions, "returnOnFail">> = {}
) => {
  const headerRow = await getFirstCSVFileRow(path, parseOptions);
  const newRow = Array.from<string>({ length: headerRow.length }).fill("");
  for (const [index, headerName] of headerRow.entries()) {
    newRow[index] = escapeCSVValue((object[headerName] ?? "").toString());
  }
  await appendFile(path, newRow.join(","), true);
};

/**
 * Append to CSV file by passing an array of primitives
 */
export const appendRowToCSVFile = async <T extends Array<string | number | boolean>>(
  path: string,
  array: T
) => {
  await appendFile(
    path,
    array
      .map((cell) => {
        return escapeCSVValue(cell.toString());
      })
      .join(","),
    true
  );
};
