/**
 * Parse takes a string of CSV data and converts it to:
 * an array of rows; where rows are an array of cells as strings
 *
 * RFC 4180, except with two improvements:
 *   - whitespace is trimmed (unless quoted)
 *   - all line endings normalised to \n
 *
 * Note that the 2D array may not be full; some rows may
 * have different numbers of cells.
 *
 * @param shouldTrimWhiteSpace trim extra whitespace between commas and newlines
 */
export const parseCSV = (csvString: string, shouldTrimWhiteSpace = true): string[][] => {
  let value = "";
  let row: string[] = [];
  let columnNumber = 1;
  let rowNumber = 1;

  const output: string[][] = [];

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

  const lexer = /"|\r\n|\n|\r|,| |\t|[^\n\r",]+/y;

  let matches: RegExpExecArray | null = null;
  let match = "";
  let state = 0;

  while ((matches = lexer.exec(csvString)) !== null) {
    match = matches[0];
    if (match.includes(",")) match = match.trim();
    if (match.startsWith("\r")) match = "\n";

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

  if (row.length > 0) {
    if (state === 2) {
      throw new Error(`Unterminated " at EOF (${rowNumber},${columnNumber})`);
    }

    addCell(state > 1);
    addRow();
  }

  return output;
};
