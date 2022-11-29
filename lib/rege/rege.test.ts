import { escape } from "./rege";

test("escape", () => {
  expect(escape(`///`)).toBe("///");
  expect(escape(`\\`)).toBe("\\\\");
  expect(escape(`hello.world*`)).toBe("hello\\.world\\*");
});
