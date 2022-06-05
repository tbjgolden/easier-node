import { appendFile, listFilesInFolder, listFilesWithinFolder } from "./filesystem";

test.skip("appendFile", async () => {
  const result = await appendFile("some.file", "str to append", true);
  expect(result).toEqual(":)");
});

test("listFilesInFolder", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters";
  const expected = ["1line.csv", "all.csv", "fail.csv"];
  const leaves = await listFilesInFolder(directoryPath, "leaves");
  expect(leaves).toEqual(expected);
  const relatives = await listFilesInFolder(directoryPath, "relative");
  expect(relatives).toEqual(
    expected.map((leaf) => {
      return `${directoryPath}/${leaf}`;
    })
  );
  const absolutes = await listFilesInFolder(directoryPath, "absolute");
  expect(absolutes).toEqual(
    expected.map((leaf) => {
      return `${process.cwd()}/${directoryPath}/${leaf}`;
    })
  );
});

test("listFilesWithinFolder", async () => {
  const directoryPath = "lib/parts/__fixtures__";
  const expected = ["1line.csv", "all.csv", "fail.csv"];
  const relatives = await listFilesWithinFolder(directoryPath, "relative");
  expect(relatives).toEqual(
    expected.map((leaf) => {
      return `${directoryPath}/${leaf}`;
    })
  );
  const absolutes = await listFilesWithinFolder(directoryPath, "absolute");
  expect(absolutes).toEqual(
    expected.map((leaf) => {
      return `${process.cwd()}/${directoryPath}/${leaf}`;
    })
  );
});
