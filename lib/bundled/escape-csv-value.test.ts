import { _doesCSVValueRequireQuotes, escapeCSVValue } from "./escape-csv-value";

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

test(`_doesCSVValueRequireQuotes`, () => {
  expect(_doesCSVValueRequireQuotes(``)).toBe(false);
  expect(_doesCSVValueRequireQuotes(` `)).toBe(true);
  expect(_doesCSVValueRequireQuotes(`\tyay`)).toBe(true);
  expect(_doesCSVValueRequireQuotes(`\n`)).toBe(true);
  expect(_doesCSVValueRequireQuotes(`\\n`)).toBe(false);
  expect(_doesCSVValueRequireQuotes(`ya,yo`)).toBe(true);
  expect(_doesCSVValueRequireQuotes(`boom`)).toBe(false);
  expect(_doesCSVValueRequireQuotes(` boom`)).toBe(true);
  expect(_doesCSVValueRequireQuotes(`boom `)).toBe(true);
  expect(_doesCSVValueRequireQuotes(` boom `)).toBe(true);
  expect(_doesCSVValueRequireQuotes(`"boom"`)).toBe(true);
  expect(_doesCSVValueRequireQuotes(`"boom`)).toBe(true);
  expect(
    _doesCSVValueRequireQuotes(
      `qwertyuiopasdfghjklzxcvbnmm1234567890-=_+[]{}\\|;:'<>./?\`~!@#$%^&*()`
    )
  ).toBe(false);
});
