import { reverseString } from "../stri/stri";

const NO_ESCAPE_NEEDED_REGEX = /^[^\s",]([^\n\r",]*[^\s",])?$|^$/;

export const doesCellNeedQuotes = (value: string): boolean => {
  return !NO_ESCAPE_NEEDED_REGEX.test(value);
};

export type ParseOptions = {
  shouldTrimWhiteSpace: boolean;
  shouldReturnOnFail: boolean;
};

/**
 * Parse takes a string of CSV data and converts it to:
 * an array of rows; where rows are an array of cells as strings
 *
 * RFC 4180, with two bonuses:
 *   - whitespace is trimmed (unless quoted); can be disabled
 *   - all line endings normalised to \n
 *
 * Note that the 2D array may not be full; some rows may
 * have different numbers of cells.
 *
 * @param options.shouldTrimWhiteSpace
 * trim extra whitespace between commas and newlines
 *
 * @param options.shouldReturnOnFail
 * if true, returns any parsed cells so far instead of throwing
 */
export const parse = (
  csvString: string,
  options: Partial<ParseOptions> = {}
): { rows: string[][]; error?: Error } => {
  const { shouldTrimWhiteSpace, shouldReturnOnFail }: ParseOptions = {
    shouldTrimWhiteSpace: true,
    shouldReturnOnFail: false,
    ...options,
  };
  const lexer = /"|\r\n|\n|\r|,| |\t|[^\n\r",]+/y;
  const output: string[][] = [];

  let value = "";
  let row: string[] = [];
  let columnNumber = 1;
  let rowNumber = 1;

  let matches: RegExpExecArray | null = null;
  let match = "";
  let state = 0;

  function addCell(isDelimited: boolean) {
    row.push(isDelimited || !shouldTrimWhiteSpace ? value : value.trim());
    value = "";
    columnNumber += 1;
  }

  function addRow() {
    output.push(row);
    row = [];
    rowNumber += 1;
    columnNumber = 1;
  }

  try {
    while ((matches = lexer.exec(csvString)) !== null) {
      match = matches[0];

      if (match.includes(",")) {
        match = match.trim();
      }
      if (match.startsWith("\r")) {
        match = "\n";
      }

      switch (state) {
        case 0: // start of cell
          switch (true) {
            case match === '"':
              state = 2;
              break;
            case match === ",":
              addCell(false);
              break;
            case match === "\n":
              addCell(false);
              addRow();
              break;
            case match === " ":
            case match === "\t":
              if (shouldTrimWhiteSpace) {
                break;
              } else {
                value += match;
                state = 1;
                break;
              }
            default:
              value += match;
              state = 1;
              break;
          }
          break;
        case 1: // input with no quotes
          switch (true) {
            case match === ",":
              state = 0;
              addCell(false);
              break;
            case match === "\n":
              state = 0;
              addCell(false);
              addRow();
              break;
            default:
              if (shouldTrimWhiteSpace) {
                throw new Error(`Expected , or \\n (${rowNumber},${columnNumber})`);
              } else {
                value += match;
                break;
              }
          }
          break;
        case 2: // input with quotes
          switch (true) {
            case match === '"':
              state = 3;
              break;
            default:
              value += match;
              break;
          }
          break;
        case 3: // input with quotes after close quote
          switch (true) {
            case match === '"': // an escaped "
              state = 2;
              value += match;
              break;
            case match === ",":
              state = 0;
              addCell(true);
              break;
            case match === "\n":
              state = 0;
              addCell(true);
              addRow();
              break;
            case match === " ":
            case match === "\t":
              if (shouldTrimWhiteSpace) {
                break;
              } else {
                throw new Error(`Expected " or , or \\n (${rowNumber},${columnNumber})`);
              }
            default:
              throw new Error(
                `Expected " or , or <whitespace> (${rowNumber},${columnNumber})`
              );
          }
          break;
      }
    }

    if (state === 2) {
      throw new Error(`Unterminated " at EOF (${rowNumber},${columnNumber})`);
    }
    if (value.length > 0) {
      addCell(state > 1);
      addRow();
    }
  } catch (rawError) {
    if (shouldReturnOnFail) {
      const error = rawError instanceof Error ? rawError : undefined;
      return {
        rows: output,
        error,
      };
    } else {
      throw rawError;
    }
  }

  return {
    rows: output,
  };
};

export const readFirstNEntries = (
  startString: string,
  n: number,
  parseOptions: Partial<
    Omit<ParseOptions, "shouldReturnOnFail"> & { isPartial: boolean }
  > = {}
): string[][] | "incomplete" => {
  const parsed = parse(startString, {
    ...parseOptions,
    shouldReturnOnFail: true,
  });

  if (parsed.rows.length < n || (parsed.rows.length === n && parseOptions.isPartial)) {
    return "incomplete";
  }

  const nonEmptyRows: string[][] = [];
  for (const row of parsed.rows) {
    if (nonEmptyRows.length === n) {
      return nonEmptyRows;
    }
    if (row.length > 0 && (row.length !== 1 || row[0] !== "")) {
      nonEmptyRows.push(row);
      if (nonEmptyRows.length === n && parsed.error === undefined) {
        return nonEmptyRows;
      }
    }
  }

  return "incomplete";
};

const CRLF_REGEX = /\r\n?/g;

export const readLastNEntries = (
  endString: string,
  n: number,
  parseOptions: Partial<
    Omit<ParseOptions, "shouldReturnOnFail"> & { isPartial: boolean }
  > = {}
): string[][] | "incomplete" => {
  const withNoCRLF = endString.replace(CRLF_REGEX, "\n");
  let lastNonNewlineIndex = withNoCRLF.length - 1;
  for (; lastNonNewlineIndex >= 0; lastNonNewlineIndex--) {
    if (withNoCRLF.codePointAt(lastNonNewlineIndex) !== 10) {
      break;
    }
  }
  const reversed = reverseString(withNoCRLF.slice(0, lastNonNewlineIndex + 1));
  const parsed = parse(reversed, {
    ...parseOptions,
    shouldReturnOnFail: true,
  });

  if (parsed.rows.length < n || (parsed.rows.length === n && parseOptions.isPartial)) {
    return "incomplete";
  }

  const nonEmptyRows: string[][] = [];
  for (const row of parsed.rows) {
    if (nonEmptyRows.length === n) {
      return nonEmptyRows;
    }
    if (row.length > 0 && (row.length !== 1 || row[0] !== "")) {
      const reversedRow: string[] = [];
      for (let index = row.length - 1; index >= 0; index--) {
        reversedRow.push(reverseString(row[index]));
      }
      nonEmptyRows.push(reversedRow);
      if (nonEmptyRows.length === n && parsed.error === undefined) {
        return nonEmptyRows;
      }
    }
  }

  return "incomplete";
};
