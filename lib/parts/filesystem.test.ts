import { appendFile } from "./filesystem";

test.skip("appendFile", async () => {
  const result = await appendFile("some.file", "str to append", true);
  expect(result).toEqual(":)");
});
