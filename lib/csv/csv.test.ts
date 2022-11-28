import {
  ERROR_TEST_CASES,
  NO_TRIM_WHITESPACE_TEST_CASES,
  RFC_TEST_CASES,
  TOLERANCE_TEST_CASES,
  WHITESPACE_TEST_CASES,
} from "../__fixtures__/csv";
import { deleteFile, readFile, writeFile } from "../filesystem/filesystem";
import {
  appendEntryToCSVFile,
  appendRowToCSVFile,
  escapeCSVValue,
  getFirstCSVFileRow,
  getLastCSVFileRow,
  parseCSV,
} from "./csv";
import {
  doesCSVValueRequireQuotes,
  getFirstNEntriesFromPartialCSV,
  getLastNEntriesFromPartialCSV,
} from "./csv.helpers";

beforeAll(async () => {
  await writeFile("lib/__fixtures__/csv/appendtest.csv", "a,b,c\n1,2,3\n");
});
afterAll(async () => {
  await deleteFile("lib/__fixtures__/csv/appendtest.csv");
});

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
    expect(parseCSV(testCase.csv.join("\n")).rows).toEqual(testCase.json);
  });
  test(`parseCSV: RFC Rule [\\r\\n] #${testCase.rfc}:\n${testCase.description.join(
    "\n"
  )}`, () => {
    expect(parseCSV(testCase.csv.join("\r\n")).rows).toEqual(testCase.json);
  });
}

test(`parseCSV: Whitespace Tests`, () => {
  for (const testCase of WHITESPACE_TEST_CASES) {
    expect(parseCSV(testCase.csv.join("\n")).rows).toEqual(testCase.json);
  }
});

test(`parseCSV: Whitespace Tests (no trim)`, () => {
  for (const testCase of NO_TRIM_WHITESPACE_TEST_CASES) {
    expect(
      parseCSV(testCase.csv.join("\n"), { shouldTrimWhiteSpace: false }).rows
    ).toEqual(testCase.json);
  }
});

test(`parseCSV: Tolerance Tests`, () => {
  for (const testCase of TOLERANCE_TEST_CASES) {
    expect(() => {
      return parseCSV(testCase.csv.join("\n")).rows;
    }).not.toThrow();
  }
});

test(`parseCSV: Error Tests`, () => {
  for (const testCase of ERROR_TEST_CASES) {
    expect(() => {
      return parseCSV(testCase.csv.join("\n")).rows;
    }).toThrow();
  }
});

test(`getFirstNEntriesFromPartialCSV`, async () => {
  const csvString = await readFile("lib/__fixtures__/csv/all.csv");
  const zerothLine = getFirstNEntriesFromPartialCSV(csvString, 0);
  const firstLine = getFirstNEntriesFromPartialCSV(csvString, 1);
  const firstFiveLines = getFirstNEntriesFromPartialCSV(csvString, 5);
  expect(zerothLine).toEqual([]);
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
  const emptyFileResult = getFirstNEntriesFromPartialCSV("", 0);
  expect(emptyFileResult).toEqual("incomplete");
});

test(`getLastNEntriesFromPartialCSV`, async () => {
  const csvString = await readFile("lib/__fixtures__/csv/all.csv");
  const zerothLastLine = getLastNEntriesFromPartialCSV(csvString, 0);
  const lastLine = getLastNEntriesFromPartialCSV(csvString, 1);
  const lastFiveLines = getLastNEntriesFromPartialCSV(csvString, 5);
  expect(zerothLastLine).toEqual([]);
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
  const emptyFileResult = getLastNEntriesFromPartialCSV("", 0);
  expect(emptyFileResult).toEqual("incomplete");
});

test(`getFirstCSVFileRow`, async () => {
  const a = await getFirstCSVFileRow("lib/__fixtures__/csv/all.csv");
  expect(a).toEqual([
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
  ]);
  const b = await getFirstCSVFileRow("lib/__fixtures__/csv/1line.csv");
  expect(b).toEqual(a);
  await getFirstCSVFileRow("lib/__fixtures__/csv/1cell.csv");

  await expect(() =>
    getFirstCSVFileRow("lib/__fixtures__/csv/fail.csv")
  ).rejects.toThrow();
  await expect(() =>
    getFirstCSVFileRow("lib/__fixtures__/csv/toolong.csv")
  ).rejects.toThrow();
  await getFirstCSVFileRow("lib/__fixtures__/csv/nottoolong.csv");
});

test(`getLastCSVFileRow`, async () => {
  const a = await getLastCSVFileRow("lib/__fixtures__/csv/all.csv");
  expect(a).toEqual([
    "2022/01/13",
    "<Our client>",
    "Phone",
    "No",
    "No",
    "No",
    "No",
    "High",
    "",
    "",
  ]);
  const b = await getLastCSVFileRow("lib/__fixtures__/csv/1line.csv");
  expect(b).toEqual([
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
  ]);
  await getLastCSVFileRow("lib/__fixtures__/csv/1cell.csv");

  await expect(() =>
    getLastCSVFileRow("lib/__fixtures__/csv/fail.csv")
  ).rejects.toThrow();
  await expect(() =>
    getLastCSVFileRow("lib/__fixtures__/csv/toolong.csv")
  ).rejects.toThrow();
  await getLastCSVFileRow("lib/__fixtures__/csv/nottoolong.csv");
});

test(`appendEntryToCSVFile`, async () => {
  expect(parseCSV(await readFile("lib/__fixtures__/csv/appendtest.csv")).rows).toEqual([
    [..."abc"],
    [..."123"],
  ]);
  await appendEntryToCSVFile("lib/__fixtures__/csv/appendtest.csv", {
    c: 6,
    b: 5,
    a: 4,
  });
  expect(parseCSV(await readFile("lib/__fixtures__/csv/appendtest.csv")).rows).toEqual([
    [..."abc"],
    [..."123"],
    [..."456"],
  ]);
});

test(`appendRowToCSVFile`, async () => {
  await appendRowToCSVFile("lib/__fixtures__/csv/appendtest.csv", [7, 8, 9]);
  expect(parseCSV(await readFile("lib/__fixtures__/csv/appendtest.csv")).rows).toEqual([
    [..."abc"],
    [..."123"],
    [..."456"],
    [..."789"],
  ]);
});

test(`extra misc coverage checks`, () => {
  expect(() => parseCSV('a," b" ,c', { shouldTrimWhiteSpace: false }).rows).toThrow();
  expect(() => parseCSV('a," b"x,c', { shouldTrimWhiteSpace: false }).rows).toThrow();
});
