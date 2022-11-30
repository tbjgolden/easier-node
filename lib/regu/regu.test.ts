import { escape } from "./regu";

test("escape", () => {
  expect(escape(`///`)).toBe("///");
  expect(escape(`\\`)).toBe("\\\\");
  expect(escape(`hello.world*`)).toBe("hello\\.world\\*");
});
