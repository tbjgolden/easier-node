import {
  appendFile,
  listFilesInFolder,
  listFilesWithinFolder,
  listFolderContents,
  listFoldersInFolder,
  listFoldersWithinFolder,
  readFile,
  writeFile,
} from "./filesystem";

test("appendFile", async () => {
  const filePath = "lib/parts/__fixtures__/recruiters/testDir/.keep";
  await writeFile(filePath, "");
  await appendFile(filePath, "a string", true);
  expect(await readFile(filePath)).toBe("a string");
  await appendFile(filePath, "b string", false);
  expect(await readFile(filePath)).toBe("a stringb string");
  await appendFile(filePath, "c string", true);
  expect(await readFile(filePath)).toBe("a stringb string\nc string");
});

afterAll(async () => {
  await writeFile("lib/parts/__fixtures__/recruiters/testDir/.keep", "");
});

test("listFilesInFolder", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters";
  const expected = ["1line.csv", "all.csv", "fail.csv"];
  const filesRelativePath = await listFilesInFolder(directoryPath, "relative-path");
  expect(filesRelativePath).toEqual(expected);
  const filesRelativeCWD = await listFilesInFolder(directoryPath, "relative-cwd");
  expect(filesRelativeCWD).toEqual(
    expected.map((leaf) => {
      return `${directoryPath}/${leaf}`;
    })
  );
  const filesAbsolute = await listFilesInFolder(directoryPath, "absolute");
  expect(filesAbsolute).toEqual(
    expected.map((leaf) => {
      return `${process.cwd()}/${directoryPath}/${leaf}`;
    })
  );
});

test("listFoldersInFolder", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters";
  const expected = ["testDir"];
  const filesRelativePath = await listFoldersInFolder(directoryPath, "relative-path");
  expect(filesRelativePath).toEqual(expected);
  const filesRelativeCWD = await listFoldersInFolder(directoryPath, "relative-cwd");
  expect(filesRelativeCWD).toEqual(
    expected.map((leaf) => {
      return `${directoryPath}/${leaf}`;
    })
  );
  const filesAbsolute = await listFoldersInFolder(directoryPath, "absolute");
  expect(filesAbsolute).toEqual(
    expected.map((leaf) => {
      return `${process.cwd()}/${directoryPath}/${leaf}`;
    })
  );
});

test("listFolderContents", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters";
  const expected = { files: ["1line.csv", "all.csv", "fail.csv"], folders: ["testDir"] };
  const filesRelativePath = await listFolderContents(directoryPath, "relative-path");
  expect(filesRelativePath).toEqual(expected);
});

test("listFilesWithinFolder", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters";
  const expected = [
    "1line.csv",
    "all.csv",
    "fail.csv",
    "testDir/.keep",
    "testDir/nestedTestDir/.keep",
  ];
  const filesRelativePath = await listFilesWithinFolder(directoryPath, "relative-path");
  expect(filesRelativePath).toEqual(expected);
  const filesRelativeCWD = await listFilesWithinFolder(directoryPath, "relative-cwd");
  expect(filesRelativeCWD).toEqual(
    expected.map((leaf) => {
      return `${directoryPath}/${leaf}`;
    })
  );
  const filesAbsolute = await listFilesWithinFolder(directoryPath, "absolute");
  expect(filesAbsolute).toEqual(
    expected.map((leaf) => {
      return `${process.cwd()}/${directoryPath}/${leaf}`;
    })
  );
});

test("listFoldersWithinFolder", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters";
  const expected = ["testDir", "testDir/nestedTestDir"];
  const filesRelativePath = await listFoldersWithinFolder(directoryPath, "relative-path");
  expect(filesRelativePath).toEqual(expected);
  const filesRelativeCWD = await listFoldersWithinFolder(directoryPath, "relative-cwd");
  expect(filesRelativeCWD).toEqual(
    expected.map((leaf) => {
      return `${directoryPath}/${leaf}`;
    })
  );
  const filesAbsolute = await listFoldersWithinFolder(directoryPath, "absolute");
  expect(filesAbsolute).toEqual(
    expected.map((leaf) => {
      return `${process.cwd()}/${directoryPath}/${leaf}`;
    })
  );
});
