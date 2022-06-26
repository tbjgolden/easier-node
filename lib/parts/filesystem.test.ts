import { deleteFolder, ensureEmptyFolderExists } from "./filesystem";
import * as f from "./filesystem";
import fs from "node:fs/promises";
import { resolvePaths } from "./path";

beforeAll(async () => {
  await ensureEmptyFolderExists("lib/parts/__fixtures__/sandbox");
});
afterAll(async () => {
  await deleteFolder("lib/parts/__fixtures__/sandbox");
});

test(`everything else`, async () => {
  const startTime = Date.now() - 100;

  const sandbox = "lib/parts/__fixtures__/sandbox";
  const fns = new Set(Object.keys(f));
  fns.delete("ensureEmptyFolderExists");
  //
  await f.writeJSONFile(sandbox + "/a.json", {
    hello: "world",
  });
  fns.delete("writeJSONFile");
  expect(await f.readJSONFile(sandbox + "/a.json")).toEqual({ hello: "world" });
  fns.delete("readJSONFile");
  await f.writeFile(sandbox + "/b.txt", "hello\n");
  fns.delete("writeFile");
  await f.createFolder(sandbox + "/c");
  fns.delete("createFolder");
  await f.moveFile(sandbox + "/b.txt", sandbox + "/c/b.txt");
  fns.delete("moveFile");
  await f.appendFile(sandbox + "/c/b.txt", "world", true);
  fns.delete("appendFile");
  expect(await f.readFile(sandbox + "/c/b.txt")).toEqual("hello\nworld");
  fns.delete("readFile");
  expect(await f.getFileBytes(sandbox + "/c/b.txt")).toBe(11);
  fns.delete("getFileBytes");
  expect(
    (await f.getFileCreatedDate(sandbox + "/c/b.txt")).getTime()
  ).toBeGreaterThanOrEqual(startTime);
  fns.delete("getFileCreatedDate");
  expect(
    (await f.getFileLastChangeDate(sandbox + "/c/b.txt")).getTime()
  ).toBeGreaterThanOrEqual(
    (await f.getFileCreatedDate(sandbox + "/c/b.txt")).getTime() - 5
  );
  fns.delete("getFileLastChangeDate");
  expect(
    await f.perLine(sandbox + "/c/b.txt", (line) => {
      if (line.startsWith("h")) return line.toUpperCase();
    })
  ).toEqual(["HELLO"]);
  fns.delete("perLine");
  await f.renameFile(sandbox + "/c/b.txt", sandbox + "/c/c.txt");
  fns.delete("renameFile");
  expect(
    await f.perFileMatch(sandbox + "/**/*.txt", (match) => {
      return match.split("/" + sandbox + "/")[1];
    })
  ).toEqual(["c/c.txt"]);
  fns.delete("perFileMatch");
  expect(await f.listFilesInFolder(sandbox + "/c")).toEqual(["c.txt"]);
  fns.delete("listFilesInFolder");
  expect(await f.listFoldersInFolder(sandbox)).toEqual(["c"]);
  fns.delete("listFoldersInFolder");
  expect(await f.listFilesWithinFolder(sandbox)).toEqual(["a.json", "c/c.txt"]);
  fns.delete("listFilesWithinFolder");
  await f.ensureFolderExists(sandbox + "/c/d");
  fns.delete("ensureFolderExists");
  expect(await f.listFoldersWithinFolder(sandbox)).toEqual(["c", "c/d"]);
  fns.delete("listFoldersWithinFolder");
  await f.moveFolder(sandbox + "/c/d", sandbox + "/b");
  fns.delete("moveFolder");
  expect(await f.listFolderContents(sandbox)).toEqual({
    files: ["a.json"],
    folders: ["b", "c"],
    others: [],
  });
  fns.delete("listFolderContents");
  await f.renameFolder(sandbox + "/b", sandbox + "/d");
  fns.delete("renameFolder");
  expect(await f.isEmptyFolder(sandbox)).toBe(false);
  expect(await f.isEmptyFolder(sandbox + "/d")).toBe(true);
  fns.delete("isEmptyFolder");
  expect(await f.isEmptyFolder(sandbox)).toBe(false);
  expect(await f.isEmptyFolder(sandbox + "/d")).toBe(true);
  await fs.symlink("./a.json", sandbox + "/b.json");
  expect(await f.listFolderContents(sandbox)).toEqual({
    files: ["a.json"],
    folders: ["c", "d"],
    others: ["b.json"],
  });
  expect(await f.isFile(sandbox + "/b.json")).toBe(false);
  expect(await f.isFile(sandbox + "/a.json")).toBe(true);
  fns.delete("isFile");
  expect(await f.isFolder(sandbox + "/c")).toBe(true);
  expect(await f.isFolder(sandbox + "/e")).toBe(false);
  fns.delete("isFolder");
  expect(await f.isEmptyFolder(sandbox + "/c")).toBe(false);
  expect(await f.isEmptyFolder(sandbox + "/d")).toBe(true);
  fns.delete("isEmptyFolder");
  expect(await f.isSymlink(sandbox + "/a.json")).toBe(false);
  expect(await f.isSymlink(sandbox + "/b.json")).toBe(true);
  fns.delete("isSymlink");
  expect(await f.doesPathExist(sandbox + "/b.json")).toBe(true);
  fns.delete("doesPathExist");
  await f.copyFolder(sandbox + "/c", sandbox + "/e");
  fns.delete("copyFolder");
  expect(await f.listFilesWithinFolder(sandbox + "/e")).toEqual(["c.txt"]);
  await f.removeFile(sandbox + "/e/c.txt");
  expect(await f.listFilesWithinFolder(sandbox + "/e")).toEqual([]);
  fns.delete("removeFile");
  await f.removeAny(sandbox + "/e");
  expect(await f.listFoldersWithinFolder(sandbox)).toEqual(["c", "d"]);
  fns.delete("removeAny");
  await f.createFolder(sandbox + "/e");
  await f.copyFolderContentsToFolder(sandbox + "/c", sandbox + "/e");
  expect(await f.listFolderContents(sandbox + "/c")).toEqual(
    await f.listFolderContents(sandbox + "/e")
  );
  expect(await f.listFolderContents(sandbox + "/e")).toEqual({
    files: ["c.txt"],
    folders: [],
    others: [],
  });
  fns.delete("copyFolderContentsToFolder");
  await f.emptyFolder(sandbox + "/e");
  expect(await f.listFolderContents(sandbox + "/e")).toEqual({
    files: [],
    folders: [],
    others: [],
  });
  fns.delete("emptyFolder");
  await f.copyFile(sandbox + "/c/c.txt", sandbox + "/d/c.txt");
  expect(await f.listFolderContents(sandbox + "/d")).toEqual({
    files: ["c.txt"],
    folders: [],
    others: [],
  });
  fns.delete("copyFile");
  await f.deleteFile(sandbox + "/d/c.txt");
  expect(await f.listFolderContents(sandbox + "/d")).toEqual({
    files: [],
    folders: [],
    others: [],
  });
  fns.delete("deleteFile");
  await f.ensureFileExists(sandbox + "/c/c.txt");
  expect(await f.readFile(sandbox + "/c/c.txt")).toBe("hello\nworld");
  fns.delete("ensureFileExists");
  await f.ensureEmptyFileExists(sandbox + "/f/c.txt");
  expect(await f.readFile(sandbox + "/f/c.txt")).toBe("");
  fns.delete("ensureEmptyFileExists");
  await f.deleteAny(sandbox + "/d");
  fns.delete("deleteAny");
  expect(
    await f.perFolderMatch(sandbox + "/*", (value) => {
      return value.slice(resolvePaths(sandbox).length + 1);
    })
  ).toEqual(["c", "e", "f"]);
  fns.delete("perFolderMatch");

  //
  fns.delete("deleteFolder");
  expect([...fns]).toEqual([]);
});
