import { isIP } from "./vali";

test("isIP", () => {
  expect(isIP("29292")).toBe(false);
  expect(isIP("1.1.1.1")).toBe(true);
  expect(isIP("1.1.1")).toBe(false);
  expect(isIP("1.1.1.01")).toBe(false);
  expect(isIP("1.1.1.-1")).toBe(false);
  expect(isIP("1.1.1.256")).toBe(false);
  expect(isIP("29292")).toBe(false);
  expect(isIP("2001:db8::8a2e:370:7334")).toBe(true);
  expect(isIP("2001:0db8:0000:0000:0000:8a2e:0370:7334")).toBe(true);
  expect(isIP("2001:0db8:0000:0000:0000:8a2g:0370:7334")).toBe(false);
  expect(isIP("2001:0db8:0000:0000:00000:8a2e:0370:7334")).toBe(false);
  expect(isIP("2001:0db8:0000:0000:8a2e:0370:7334")).toBe(false);
});
