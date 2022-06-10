import { resolveURLs } from "./url";

test(`resolveURLs`, () => {
  expect(resolveURLs("https://google.com/", "https://yahoo.com/")).toBe("");
});
