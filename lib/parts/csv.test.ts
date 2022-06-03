import { escapeCSVValue, parseCSV } from "./csv";
import {
  doesCSVValueRequireQuotes,
  getFirstNEntriesFromPartialCSV,
  getLastNEntriesFromPartialCSV,
} from "./csv.helpers";
import { readFile } from "./filesystem";
import {
  ERROR_TEST_CASES,
  NO_TRIM_WHITESPACE_TEST_CASES,
  RFC_TEST_CASES,
  TOLERANCE_TEST_CASES,
  WHITESPACE_TEST_CASES,
} from "./__fixtures__/csv";

test(`escapeCSVValue`, () => {
  expect(escapeCSVValue(``)).toBe(``);
  expect(escapeCSVValue(` `)).toBe(`" "`);
  expect(escapeCSVValue(`\tyay`)).toBe(`"\tyay"`);
  expect(escapeCSVValue(`\n`)).toBe(`"\n"`);
  expect(escapeCSVValue(`\\n`)).toBe(`\\n`);
  expect(escapeCSVValue(`ya,yo`)).toBe(`"ya,yo"`);
  expect(escapeCSVValue(`boom`)).toBe(`boom`);
  expect(escapeCSVValue(` boom`)).toBe(`" boom"`);
  expect(escapeCSVValue(`boom `)).toBe(`"boom "`);
  expect(escapeCSVValue(` boom `)).toBe(`" boom "`);
  expect(escapeCSVValue(`"boom"`)).toBe(`"""boom"""`);
  expect(escapeCSVValue(`"boom`)).toBe(`"""boom"`);
  expect(
    escapeCSVValue(
      `qwertyuiopasdfghjklzxcvbnmm1234567890-=_+[]{}\\|;:'<>./?\`~!@#$%^&*()`
    )
  ).toBe(`qwertyuiopasdfghjklzxcvbnmm1234567890-=_+[]{}\\|;:'<>./?\`~!@#$%^&*()`);
});

test(`doesCSVValueRequireQuotes`, () => {
  expect(doesCSVValueRequireQuotes(``)).toBe(false);
  expect(doesCSVValueRequireQuotes(` `)).toBe(true);
  expect(doesCSVValueRequireQuotes(`\tyay`)).toBe(true);
  expect(doesCSVValueRequireQuotes(`\n`)).toBe(true);
  expect(doesCSVValueRequireQuotes(`\\n`)).toBe(false);
  expect(doesCSVValueRequireQuotes(`ya,yo`)).toBe(true);
  expect(doesCSVValueRequireQuotes(`boom`)).toBe(false);
  expect(doesCSVValueRequireQuotes(` boom`)).toBe(true);
  expect(doesCSVValueRequireQuotes(`boom `)).toBe(true);
  expect(doesCSVValueRequireQuotes(` boom `)).toBe(true);
  expect(doesCSVValueRequireQuotes(`"boom"`)).toBe(true);
  expect(doesCSVValueRequireQuotes(`"boom`)).toBe(true);
  expect(
    doesCSVValueRequireQuotes(
      `qwertyuiopasdfghjklzxcvbnmm1234567890-=_+[]{}\\|;:'<>./?\`~!@#$%^&*()`
    )
  ).toBe(false);
});

for (const testCase of RFC_TEST_CASES) {
  test(`parseCSV: RFC Rule [\\n] #${testCase.rfc}:\n${testCase.description.join(
    "\n"
  )}`, () => {
    expect(parseCSV(testCase.csv.join("\n"))).toEqual(testCase.json);
  });
  test(`parseCSV: RFC Rule [\\r\\n] #${testCase.rfc}:\n${testCase.description.join(
    "\n"
  )}`, () => {
    expect(parseCSV(testCase.csv.join("\r\n"))).toEqual(testCase.json);
  });
}

test(`parseCSV: Whitespace Tests`, () => {
  for (const testCase of WHITESPACE_TEST_CASES) {
    expect(parseCSV(testCase.csv.join("\n"))).toEqual(testCase.json);
  }
});

test(`parseCSV: Whitespace Tests (no trim)`, () => {
  for (const testCase of NO_TRIM_WHITESPACE_TEST_CASES) {
    expect(parseCSV(testCase.csv.join("\n"), { shouldTrimWhiteSpace: false })).toEqual(
      testCase.json
    );
  }
});

test(`parseCSV: Tolerance Tests`, () => {
  for (const testCase of TOLERANCE_TEST_CASES) {
    expect(() => {
      return parseCSV(testCase.csv.join("\n"));
    }).not.toThrow();
  }
});

test(`parseCSV: Error Tests`, () => {
  for (const testCase of ERROR_TEST_CASES) {
    expect(() => {
      return parseCSV(testCase.csv.join("\n"));
    }).toThrow();
  }
});

test(`getFirstNEntriesFromPartialCSV`, async () => {
  const csvString = await readFile("lib/parts/__fixtures__/recruiters.csv");
  const firstLine = getFirstNEntriesFromPartialCSV(csvString, 1);
  const firstFiveLines = getFirstNEntriesFromPartialCSV(csvString, 5);
  expect(firstLine).toEqual([
    [
      "Date",
      "Company",
      "Method",
      "in-house",
      "copy-paste",
      "got basic detail wrong",
      "wrong tech stack",
      "Bullshit Level",
      "dafuq",
      "!",
    ],
  ]);
  expect(firstFiveLines).toEqual([
    [
      "Date",
      "Company",
      "Method",
      "in-house",
      "copy-paste",
      "got basic detail wrong",
      "wrong tech stack",
      "Bullshit Level",
      "dafuq",
      "!",
    ],
    [
      "2021/11/15",
      "<Our client>",
      "LinkedIn (DM)",
      "No",
      "Yes",
      "No",
      "No",
      "None",
      "",
      "",
    ],
    ["2021/11/15", "Scouty", "LinkedIn (DM)", "No", "Yes", "No", "No", "None", "", ""],
    [
      "2021/11/15",
      "<Our client>",
      "LinkedIn (DM)",
      "No",
      "Yes",
      "No",
      "No",
      "Low",
      "",
      "",
    ],
    ["2021/11/16", "Plum Guide", "LinkedIn (DM)", "No", "Yes", "No", "No", "Low", "", ""],
  ]);
});

test(`getLastNEntriesFromPartialCSV`, async () => {
  const csvString = await readFile("lib/parts/__fixtures__/recruiters.csv");
  const lastLine = getLastNEntriesFromPartialCSV(csvString, 1);
  const lastFiveLines = getLastNEntriesFromPartialCSV(csvString, 5);
  expect(lastLine).toEqual([
    ["2022/01/13", "<Our client>", "Phone", "No", "No", "No", "No", "High", "", ""],
  ]);
  expect(lastFiveLines).toEqual([
    ["2022/01/13", "<Our client>", "Phone", "No", "No", "No", "No", "High", "", ""],
    ["2022/02/03", "<Our client>", "Phone", "No", "No", "No", "No", "High", "", ""],
    [
      "2021/11/15",
      "<Open to opportunities>",
      "Email",
      "No",
      "Yes",
      "No",
      "No",
      "High",
      "",
      "",
    ],
    ["2021/11/16", "Switchboard", "Email", "No", "Yes", "No", "No", "High", "", ""],
    ["2021/11/18", "The Nerdery", "Email", "No", "Yes", "No", "No", "High", "", ""],
  ]);
});
