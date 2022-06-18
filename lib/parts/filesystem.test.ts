import {
  appendFile,
  isFile,
  isFolder,
  isSymlink,
  listFilesInFolder,
  listFilesWithinFolder,
  listFolderContents,
  listFoldersInFolder,
  listFoldersWithinFolder,
  moveFile,
  moveFolder,
  perFileMatch,
  perFolderMatch,
  perLine,
  readFile,
  writeFile,
} from "./filesystem";
import fs from "node:fs/promises";
import { getRelativePath } from "./path";

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
  const expected = {
    files: ["1line.csv", "all.csv", "fail.csv"],
    folders: ["testDir"],
    others: [],
  };
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

test("isFile, isFolder, isSymlink", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters";
  await fs.symlink("..", directoryPath + "/symlink1");
  await fs.symlink("./all.csv", directoryPath + "/symlink2");
  expect(await isFile(directoryPath + "/all.csv")).toBe(true);
  expect(await isFile(directoryPath + "/not-a-real-file.csv")).toBe(false);
  expect(await isFile(directoryPath)).toBe(false);
  expect(await isFile(directoryPath + "/not-a-real-folder")).toBe(false);
  expect(await isFile(directoryPath + "/not-a-real-folder/not-a-real-file.csv")).toBe(
    false
  );
  expect(await isFile(directoryPath + "/symlink1")).toBe(false);
  expect(await isFile(directoryPath + "/symlink2")).toBe(false);
  expect(await isFolder(directoryPath + "/all.csv")).toBe(false);
  expect(await isFolder(directoryPath + "/not-a-real-file.csv")).toBe(false);
  expect(await isFolder(directoryPath)).toBe(true);
  expect(await isFolder(directoryPath + "/not-a-real-folder")).toBe(false);
  expect(await isFolder(directoryPath + "/not-a-real-folder/not-a-real-file.csv")).toBe(
    false
  );
  expect(await isFolder(directoryPath + "/symlink1")).toBe(false);
  expect(await isFolder(directoryPath + "/symlink2")).toBe(false);
  expect(await isSymlink(directoryPath + "/all.csv")).toBe(false);
  expect(await isSymlink(directoryPath + "/not-a-real-file.csv")).toBe(false);
  expect(await isSymlink(directoryPath)).toBe(false);
  expect(await isSymlink(directoryPath + "/not-a-real-folder")).toBe(false);
  expect(await isSymlink(directoryPath + "/not-a-real-folder/not-a-real-file.csv")).toBe(
    false
  );
  expect(await isSymlink(directoryPath + "/symlink1")).toBe(true);
  expect(await isSymlink(directoryPath + "/symlink2")).toBe(true);
});

test("moveFile", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters/testDir";
  expect(await listFolderContents(directoryPath)).toEqual({
    files: [".keep"],
    folders: ["nestedTestDir"],
    others: [],
  });
  await moveFile(directoryPath + "/.keep", directoryPath + "/.keep.1");
  expect(await listFolderContents(directoryPath)).toEqual({
    files: [".keep.1"],
    folders: ["nestedTestDir"],
    others: [],
  });
  await moveFile(directoryPath + "/.keep.1", directoryPath + "/.keep");
  expect(await listFolderContents(directoryPath)).toEqual({
    files: [".keep"],
    folders: ["nestedTestDir"],
    others: [],
  });
});

test("moveFolder", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters/testDir";
  expect(await listFolderContents(directoryPath)).toEqual({
    files: [".keep"],
    folders: ["nestedTestDir"],
    others: [],
  });
  await moveFolder(directoryPath + "/nestedTestDir", directoryPath + "/nestedTestDir.1");
  expect(await listFolderContents(directoryPath)).toEqual({
    files: [".keep"],
    folders: ["nestedTestDir.1"],
    others: [],
  });
  await moveFolder(directoryPath + "/nestedTestDir.1", directoryPath + "/nestedTestDir");
  expect(await listFolderContents(directoryPath)).toEqual({
    files: [".keep"],
    folders: ["nestedTestDir"],
    others: [],
  });
});

test("perFileMatch", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters/testDir";
  const cwd = process.cwd();
  const expected = [directoryPath + "/.keep", directoryPath + "/nestedTestDir/.keep"];
  expect(
    await perFileMatch(directoryPath + "/**", (filePath: string) => {
      return getRelativePath(cwd, filePath);
    })
  ).toEqual(expected);
  expect(
    await perFileMatch(
      "**",
      (filePath: string) => {
        return getRelativePath(cwd, filePath);
      },
      cwd + "/" + directoryPath
    )
  ).toEqual(expected);
  expect(
    await perFileMatch(
      "*",
      (filePath: string) => {
        return getRelativePath(cwd, filePath);
      },
      cwd + "/" + directoryPath
    )
  ).toEqual([expected[0]]);
  expect(
    await perFileMatch(
      "*/*",
      (filePath: string) => {
        return getRelativePath(cwd, filePath);
      },
      cwd + "/" + directoryPath
    )
  ).toEqual([expected[1]]);
});

test("perFolderMatch", async () => {
  const directoryPath = "lib/parts/__fixtures__/recruiters/testDir";
  const cwd = process.cwd();
  const expected = [directoryPath + "/nestedTestDir"];
  expect(
    await perFolderMatch(directoryPath + "/**", (filePath: string) => {
      return getRelativePath(cwd, filePath);
    })
  ).toEqual(expected);
  expect(
    await perFolderMatch(
      "**",
      (filePath: string) => {
        return getRelativePath(cwd, filePath);
      },
      cwd + "/" + directoryPath
    )
  ).toEqual(expected);
});

test("perLine", async () => {
  const lines: string[] = [];
  await perLine("lib/parts/__fixtures__/recruiters/all.csv", (line: string) => {
    if (line.startsWith("2022/02/23,")) {
      lines.push(line);
    }
  });

  expect(lines).toEqual([
    "2022/02/23,<Our client>,LinkedIn (DM),No,Yes,No,No,High,,",
    "2022/02/23,<Open to opportunities>,LinkedIn (DM),No,Yes,No,No,High,,",
    "2022/02/23,<Our client>,LinkedIn (DM),No,Yes,No,No,Low,,",
    "2022/02/23,Ecologi,LinkedIn (DM),Yes,Yes,No,No,Moderate,,",
    "2022/02/23,Signal AI,LinkedIn (Req),No,Yes,No,No,High,,",
    "2022/02/23,<Open to opportunities>,LinkedIn (Req),No,Yes,No,No,Moderate,,",
    "2022/02/23,<Our client>,Email,No,Yes,No,No,High,,",
    "2022/02/23,<Open to opportunities>,Email,No,Yes,No,No,High,,",
  ]);
});

afterAll(async () => {
  await writeFile("lib/parts/__fixtures__/recruiters/testDir/.keep", "");
  await fs.unlink("lib/parts/__fixtures__/recruiters/symlink1");
  await fs.unlink("lib/parts/__fixtures__/recruiters/symlink2");
});
