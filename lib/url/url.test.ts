import { resolve } from "./url";

test(`resolve`, () => {
  expect(resolve("https://google.com/", "https://yahoo.com:443/")).toBe(
    "https://yahoo.com"
  );
});
