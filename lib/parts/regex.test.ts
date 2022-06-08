import { escapeStringForRegex } from "./regex";

test("escapeStringForRegex", () => {
  expect(escapeStringForRegex(`///`)).toBe("///");
  expect(escapeStringForRegex(`\\`)).toBe("\\\\");
  expect(escapeStringForRegex(`hello.world*`)).toBe("hello\\.world\\*");
});
