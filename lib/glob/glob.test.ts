import { toRegex } from "./glob";

test("toRegex", () => {
  expect(toRegex(`./**/*.{ts,tsx}`).test(process.cwd() + "/wow/test.tsx")).toBe(true);
  expect(toRegex(`./nothing/much.here`).test(process.cwd() + "/nothing/much.here")).toBe(
    true
  );
  expect(toRegex(`./**/*.{ts,tsx}`).test("/wow/test.tsx")).toBe(false);
  expect(toRegex(`./nothing/much.here`).test("/nothing/much.here")).toBe(false);
  expect(toRegex(`./**/*.{ts,tsx}`).test(process.cwd() + "/wow/test.ts")).toBe(true);
  expect(toRegex(`./**/*.{ts,tsx}`).test(process.cwd() + "/wow/test.t")).toBe(false);
  expect(toRegex(`./**/*.{ts,tsx}`).test(process.cwd() + "/wow/foo/bar/test.ts")).toBe(
    true
  );
  expect(toRegex(`./**/*.{ts,tsx}`).test(process.cwd() + "/a/.ts")).toBe(true);
  expect(toRegex(`./**/*.{ts,tsx}`).test(process.cwd() + "/.ts")).toBe(true);
  expect(toRegex(`./**/*.{ts,tsx}`).test(process.cwd() + "ss/.ts")).toBe(false);
  expect(toRegex(`./**/*.{ts,tsx}`).test(process.cwd() + "/test.ts")).toBe(true);
  expect(toRegex(`./**/{.keep,.*.tmp}`).test(process.cwd() + "/.keep")).toBe(true);
  expect(toRegex(`./**/{.keep,.*.tmp}`).test(process.cwd() + "/.tmp")).toBe(false);
  expect(toRegex(`./**/{.keep,.*.tmp}`).test(process.cwd() + "/.keep.temp")).toBe(false);
  expect(toRegex(`./**/{.keep,.*.tmp}`).test(process.cwd() + "/.keep.tmp")).toBe(true);
  expect(toRegex(`./**/{.keep,.*.tmp}`).test(process.cwd() + "/a/.hi.tmp")).toBe(true);
});
