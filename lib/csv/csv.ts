import { appendFile } from "../file/file";
import { getFirstNBytes, getLastNBytes } from "../file/file.helpers";
import {
  doesCellNeedQuotes,
  ParseOptions,
  readFirstNEntries,
  readLastNEntries,
} from "./csv.helpers";
export { parse } from "./csv.helpers";

export const escape = (value: string): string => {
  return doesCellNeedQuotes(value) ? '"' + value.replaceAll('"', '""') + '"' : value;
};

export const getFirstRowFromFile = async (
  path: string,
  parseOptions: Partial<Omit<ParseOptions, "returnOnFail">> = {}
) => {
  for (let byteCount = 4096; byteCount <= 262_144; byteCount = byteCount + byteCount) {
    const firstBytes = await getFirstNBytes(path, byteCount);
    const firstString = Buffer.from(firstBytes).toString("utf8");
    const firstEntry = readFirstNEntries(firstString, 1, {
      ...parseOptions,
      isPartial: firstBytes.length === byteCount,
    });
    if (firstEntry !== "incomplete") {
      return firstEntry[0];
    }
  }
  throw new Error("Could not parse first row");
};

export const getLastRowFromFile = async (
  path: string,
  parseOptions: Partial<Omit<ParseOptions, "returnOnFail">> = {}
) => {
  for (let byteCount = 4096; byteCount <= 262_144; byteCount = byteCount + byteCount) {
    const lastBytes = await getLastNBytes(path, byteCount);
    const lastString = Buffer.from(lastBytes).toString("utf8");
    const lastEntry = readLastNEntries(lastString, 1, {
      ...parseOptions,
      isPartial: lastBytes.length === byteCount,
    });
    if (lastEntry !== "incomplete") {
      return lastEntry[0];
    }
  }
  throw new Error("Could not parse last row");
};

export const appendEntryToFile = async <
  T extends Record<string, string | number | boolean | undefined>
>(
  path: string,
  object: T,
  parseOptions: Partial<Omit<ParseOptions, "returnOnFail">> = {}
) => {
  const headerRow = await getFirstRowFromFile(path, parseOptions);
  const newRow = Array.from<string>({ length: headerRow.length }).fill("");
  for (const [index, headerName] of headerRow.entries()) {
    newRow[index] = escape((object[headerName] ?? "").toString());
  }
  await appendFile(path, newRow.join(","), true);
};

export const appendRowToFile = async <T extends Array<string | number | boolean>>(
  path: string,
  array: T
) => {
  await appendFile(path, array.map((cell) => escape(cell.toString())).join(","), true);
};
