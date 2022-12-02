import { escape } from "./regu";

test("escape", () => {
  expect(escape(`///`)).toBe("///");
  expect(escape(`\\`)).toBe("\\\\");
  expect(escape(`hello.world*`)).toBe("hello\\.world\\*");
  expect(escape(`hello\n.world\t*`)).toBe("hello\\n\\.world\\t\\*");
});
