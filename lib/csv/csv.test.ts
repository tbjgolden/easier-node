import {
  ERROR_TEST_CASES,
  NO_TRIM_WHITESPACE_TEST_CASES,
  RFC_TEST_CASES,
  TOLERANCE_TEST_CASES,
  WHITESPACE_TEST_CASES,
} from "../__fixtures__/csv";
import { deleteFile, readFile, writeFile } from "../file/file";
import {
  appendEntryToFile,
  appendRowToFile,
  escape,
  getFirstRowFromFile,
  getLastRowFromFile,
  parse,
} from "./csv";
import { doesCellNeedQuotes, readFirstNEntries, readLastNEntries } from "./csv.helpers";

beforeAll(async () => {
  await writeFile("lib/__fixtures__/csv/appendtest.csv", "a,b,c\n1,2,3\n");
});
afterAll(async () => {
  await deleteFile("lib/__fixtures__/csv/appendtest.csv");
});

test(`escape`, () => {
  expect(escape(``)).toBe(``);
  expect(escape(` `)).toBe(`" "`);
  expect(escape(`\tyay`)).toBe(`"\tyay"`);
  expect(escape(`\n`)).toBe(`"\n"`);
  expect(escape(`\\n`)).toBe(`\\n`);
  expect(escape(`ya,yo`)).toBe(`"ya,yo"`);
  expect(escape(`boom`)).toBe(`boom`);
  expect(escape(` boom`)).toBe(`" boom"`);
  expect(escape(`boom `)).toBe(`"boom "`);
  expect(escape(` boom `)).toBe(`" boom "`);
  expect(escape(`"boom"`)).toBe(`"""boom"""`);
  expect(escape(`"boom`)).toBe(`"""boom"`);
  expect(
    escape(`qwertyuiopasdfghjklzxcvbnmm1234567890-=_+[]{}\\|;:'<>./?\`~!@#$%^&*()`)
  ).toBe(`qwertyuiopasdfghjklzxcvbnmm1234567890-=_+[]{}\\|;:'<>./?\`~!@#$%^&*()`);
});

test(`doesCellNeedQuotes`, () => {
  expect(doesCellNeedQuotes(``)).toBe(false);
  expect(doesCellNeedQuotes(` `)).toBe(true);
  expect(doesCellNeedQuotes(`\tyay`)).toBe(true);
  expect(doesCellNeedQuotes(`\n`)).toBe(true);
  expect(doesCellNeedQuotes(`\\n`)).toBe(false);
  expect(doesCellNeedQuotes(`ya,yo`)).toBe(true);
  expect(doesCellNeedQuotes(`boom`)).toBe(false);
  expect(doesCellNeedQuotes(` boom`)).toBe(true);
  expect(doesCellNeedQuotes(`boom `)).toBe(true);
  expect(doesCellNeedQuotes(` boom `)).toBe(true);
  expect(doesCellNeedQuotes(`"boom"`)).toBe(true);
  expect(doesCellNeedQuotes(`"boom`)).toBe(true);
  expect(
    doesCellNeedQuotes(
      `qwertyuiopasdfghjklzxcvbnmm1234567890-=_+[]{}\\|;:'<>./?\`~!@#$%^&*()`
    )
  ).toBe(false);
});

for (const testCase of RFC_TEST_CASES) {
  test(`parse: RFC Rule [\\n] #${testCase.rfc}:\n${testCase.description.join(
    "\n"
  )}`, () => {
    expect(parse(testCase.csv.join("\n")).rows).toEqual(testCase.json);
  });
  test(`parse: RFC Rule [\\r\\n] #${testCase.rfc}:\n${testCase.description.join(
    "\n"
  )}`, () => {
    expect(parse(testCase.csv.join("\r\n")).rows).toEqual(testCase.json);
  });
}

test(`parse: Whitespace Tests`, () => {
  for (const testCase of WHITESPACE_TEST_CASES) {
    expect(parse(testCase.csv.join("\n")).rows).toEqual(testCase.json);
  }
});

test(`parse: Whitespace Tests (no trim)`, () => {
  for (const testCase of NO_TRIM_WHITESPACE_TEST_CASES) {
    expect(parse(testCase.csv.join("\n"), { shouldTrimWhiteSpace: false }).rows).toEqual(
      testCase.json
    );
  }
});

test(`parse: Tolerance Tests`, () => {
  for (const testCase of TOLERANCE_TEST_CASES) {
    expect(() => {
      return parse(testCase.csv.join("\n")).rows;
    }).not.toThrow();
  }
});

test(`parse: Error Tests`, () => {
  for (const testCase of ERROR_TEST_CASES) {
    expect(() => {
      return parse(testCase.csv.join("\n")).rows;
    }).toThrow();
  }
});

test(`readFirstNEntries`, async () => {
  const csvString = await readFile("lib/__fixtures__/csv/all.csv");
  const zerothLine = readFirstNEntries(csvString, 0);
  const firstLine = readFirstNEntries(csvString, 1);
  const firstFiveLines = readFirstNEntries(csvString, 5);
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
  const emptyFileResult = readFirstNEntries("", 0);
  expect(emptyFileResult).toEqual("incomplete");
});

test(`getLastNEntriesFromPartialCSV`, async () => {
  const csvString = await readFile("lib/__fixtures__/csv/all.csv");
  const zerothLastLine = readLastNEntries(csvString, 0);
  const lastLine = readLastNEntries(csvString, 1);
  const lastFiveLines = readLastNEntries(csvString, 5);
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
  const emptyFileResult = readLastNEntries("", 0);
  expect(emptyFileResult).toEqual("incomplete");
});

test(`getFirstRowFromFile`, async () => {
  const a = await getFirstRowFromFile("lib/__fixtures__/csv/all.csv");
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
  const b = await getFirstRowFromFile("lib/__fixtures__/csv/1line.csv");
  expect(b).toEqual(a);
  await getFirstRowFromFile("lib/__fixtures__/csv/1cell.csv");

  await expect(() =>
    getFirstRowFromFile("lib/__fixtures__/csv/fail.csv")
  ).rejects.toThrow();
  await expect(() =>
    getFirstRowFromFile("lib/__fixtures__/csv/toolong.csv")
  ).rejects.toThrow();
  await getFirstRowFromFile("lib/__fixtures__/csv/nottoolong.csv");
});

test(`getLastRowFromFile`, async () => {
  const a = await getLastRowFromFile("lib/__fixtures__/csv/all.csv");
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
  const b = await getLastRowFromFile("lib/__fixtures__/csv/1line.csv");
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
  await getLastRowFromFile("lib/__fixtures__/csv/1cell.csv");

  await expect(() =>
    getLastRowFromFile("lib/__fixtures__/csv/fail.csv")
  ).rejects.toThrow();
  await expect(() =>
    getLastRowFromFile("lib/__fixtures__/csv/toolong.csv")
  ).rejects.toThrow();
  await getLastRowFromFile("lib/__fixtures__/csv/nottoolong.csv");
});

test(`appendEntryToFile`, async () => {
  expect(parse(await readFile("lib/__fixtures__/csv/appendtest.csv")).rows).toEqual([
    [..."abc"],
    [..."123"],
  ]);
  await appendEntryToFile("lib/__fixtures__/csv/appendtest.csv", {
    c: 6,
    b: 5,
    a: 4,
  });
  expect(parse(await readFile("lib/__fixtures__/csv/appendtest.csv")).rows).toEqual([
    [..."abc"],
    [..."123"],
    [..."456"],
  ]);
});

test(`appendRowToFile`, async () => {
  await appendRowToFile("lib/__fixtures__/csv/appendtest.csv", [7, 8, 9]);
  expect(parse(await readFile("lib/__fixtures__/csv/appendtest.csv")).rows).toEqual([
    [..."abc"],
    [..."123"],
    [..."456"],
    [..."789"],
  ]);
});

test(`extra misc coverage checks`, () => {
  expect(() => parse('a," b" ,c', { shouldTrimWhiteSpace: false }).rows).toThrow();
  expect(() => parse('a," b"x,c', { shouldTrimWhiteSpace: false }).rows).toThrow();
});
