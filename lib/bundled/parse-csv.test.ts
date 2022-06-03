import { parseCSV } from "./parse-csv";
import {
  ERROR_TEST_CASES,
  NO_TRIM_WHITESPACE_TEST_CASES,
  RFC_TEST_CASES,
  TOLERANCE_TEST_CASES,
  WHITESPACE_TEST_CASES,
} from "./__fixtures__/parse-csv";

for (const testCase of RFC_TEST_CASES) {
  test(`RFC Rule [\\n] #${testCase.rfc}:\n${testCase.description.join("\n")}`, () => {
    expect(parseCSV(testCase.csv.join("\n"))).toEqual(testCase.json);
  });
  test(`RFC Rule [\\r\\n] #${testCase.rfc}:\n${testCase.description.join("\n")}`, () => {
    expect(parseCSV(testCase.csv.join("\r\n"))).toEqual(testCase.json);
  });
}

test(`Whitespace Tests`, () => {
  for (const testCase of WHITESPACE_TEST_CASES) {
    expect(parseCSV(testCase.csv.join("\n"))).toEqual(testCase.json);
  }
});

test(`Whitespace Tests (no trim)`, () => {
  for (const testCase of NO_TRIM_WHITESPACE_TEST_CASES) {
    expect(parseCSV(testCase.csv.join("\n"), false)).toEqual(testCase.json);
  }
});

test(`Tolerance Tests`, () => {
  for (const testCase of TOLERANCE_TEST_CASES) {
    expect(() => {
      return parseCSV(testCase.csv.join("\n"));
    }).not.toThrow();
  }
});

test(`Error Tests`, () => {
  for (const testCase of ERROR_TEST_CASES) {
    expect(() => {
      return parseCSV(testCase.csv.join("\n"));
    }).toThrow();
  }
});
