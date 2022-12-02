import { v4 } from "./uuid";

test(`v4`, () => {
  const a = v4();
  const b = v4();
  expect(v4()).toMatch(/^[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}$/g);
  expect(a).not.toBe(b);
});
