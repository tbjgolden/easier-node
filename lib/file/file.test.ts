import fs from "node:fs/promises";

import { resolve } from "../path/path";
import {
  appendFile,
  copyFile,
  copyFolder,
  copyFolderContentsToFolder,
  createFolder,
  deleteAny,
  deleteFile,
  deleteFolder,
  doesPathExist,
  emptyFolder,
  ensureEmptyFileExists,
  ensureEmptyFolderExists,
  ensureFileExists,
  ensureFolderExists,
  getFileBytes,
  getFileCreatedDate,
  getFileLastChangeDate,
  isEmptyFolder,
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
  readJSONFile,
  removeAny,
  removeFile,
  renameFile,
  renameFolder,
  writeFile,
  writeJSONFile,
} from "./file";

const sandbox = "lib/__fixtures__/sandbox";
let startTime = Date.now() - 100;

beforeAll(async () => {
  await ensureEmptyFolderExists("lib/__fixtures__/sandbox");
  startTime = Date.now() - 100;
});
afterAll(async () => {
  await deleteFolder("lib/__fixtures__/sandbox");
});

test(`writeJSONFile + readJSONFile`, async () => {
  await writeJSONFile(`${sandbox}/a.json`, {
    hello: "world",
  });
  expect(await readJSONFile(`${sandbox}/a.json`)).toEqual({ hello: "world" });
});

test(`writeFile + createFolder + moveFile + appendFile + readFile + getFileBytes + getFileCreatedDate + getFileLastChangeDate`, async () => {
  await writeFile(`${sandbox}/b.txt`, "hello\n");
  await createFolder(`${sandbox}/c`);
  await moveFile(`${sandbox}/b.txt`, `${sandbox}/c/b.txt`);
  await appendFile(`${sandbox}/c/b.txt`, "world", true);
  expect(await readFile(`${sandbox}/c/b.txt`)).toEqual("hello\nworld");
  expect(await getFileBytes(`${sandbox}/c/b.txt`)).toBe(11);
  expect(
    (await getFileCreatedDate(`${sandbox}/c/b.txt`)).getTime()
  ).toBeGreaterThanOrEqual(startTime);
  expect(
    (await getFileLastChangeDate(`${sandbox}/c/b.txt`)).getTime()
  ).toBeGreaterThanOrEqual(
    (await getFileCreatedDate(`${sandbox}/c/b.txt`)).getTime() - 5
  );
});

test("misc others", async () => {
  expect(
    await perLine(`${sandbox}/c/b.txt`, (line) => {
      if (line.startsWith("h")) {
        return line.toUpperCase();
      }
    })
  ).toEqual(["HELLO"]);
  await renameFile(`${sandbox}/c/b.txt`, `${sandbox}/c/c.txt`);
  expect(
    await perFileMatch(`${sandbox}/**/*.txt`, (match) => {
      return match.split(`/${sandbox}/`)[1];
    })
  ).toEqual(["c/c.txt"]);
  expect(await listFilesInFolder(`${sandbox}/c`)).toEqual(["c.txt"]);
  expect(await listFoldersInFolder(sandbox)).toEqual(["c"]);
  expect(await listFilesWithinFolder(sandbox)).toEqual(["a.json", "c/c.txt"]);
  await ensureFolderExists(`${sandbox}/c/d`);
  expect(await listFoldersWithinFolder(sandbox)).toEqual(["c", "c/d"]);
  await moveFolder(`${sandbox}/c/d`, `${sandbox}/b`);
  expect(await listFolderContents(sandbox)).toEqual({
    files: ["a.json"],
    folders: ["b", "c"],
    others: [],
  });
  await renameFolder(`${sandbox}/b`, `${sandbox}/d`);
  expect(await isEmptyFolder(sandbox)).toBe(false);
  expect(await isEmptyFolder(`${sandbox}/d`)).toBe(true);
  expect(await isEmptyFolder(sandbox)).toBe(false);
  expect(await isEmptyFolder(`${sandbox}/d`)).toBe(true);
  await fs.symlink("./a.json", `${sandbox}/b.json`);
  expect(await listFolderContents(sandbox)).toEqual({
    files: ["a.json"],
    folders: ["c", "d"],
    others: ["b.json"],
  });
  expect(await isFile(`${sandbox}/b.json`)).toBe(false);
  expect(await isFile(`${sandbox}/a.json`)).toBe(true);
  expect(await isFolder(`${sandbox}/c`)).toBe(true);
  expect(await isFolder(`${sandbox}/e`)).toBe(false);
  expect(await isEmptyFolder(`${sandbox}/c`)).toBe(false);
  expect(await isEmptyFolder(`${sandbox}/d`)).toBe(true);
  expect(await isSymlink(`${sandbox}/a.json`)).toBe(false);
  expect(await isSymlink(`${sandbox}/b.json`)).toBe(true);
  expect(await doesPathExist(`${sandbox}/b.json`)).toBe(true);
  await copyFolder(`${sandbox}/c`, `${sandbox}/e`);
  expect(await listFilesWithinFolder(`${sandbox}/e`)).toEqual(["c.txt"]);
  await removeFile(`${sandbox}/e/c.txt`);
  expect(await listFilesWithinFolder(`${sandbox}/e`)).toEqual([]);
  await removeAny(`${sandbox}/e`);
  expect(await listFoldersWithinFolder(sandbox)).toEqual(["c", "d"]);
  await createFolder(`${sandbox}/e`);
  await copyFolderContentsToFolder(`${sandbox}/c`, `${sandbox}/e`);
  expect(await listFolderContents(`${sandbox}/c`)).toEqual(
    await listFolderContents(`${sandbox}/e`)
  );
  expect(await listFolderContents(`${sandbox}/e`)).toEqual({
    files: ["c.txt"],
    folders: [],
    others: [],
  });
  await emptyFolder(`${sandbox}/e`);
  expect(await listFolderContents(`${sandbox}/e`)).toEqual({
    files: [],
    folders: [],
    others: [],
  });
  await copyFile(`${sandbox}/c/c.txt`, `${sandbox}/d/c.txt`);
  expect(await listFolderContents(`${sandbox}/d`)).toEqual({
    files: ["c.txt"],
    folders: [],
    others: [],
  });
  await deleteFile(`${sandbox}/d/c.txt`);
  expect(await listFolderContents(`${sandbox}/d`)).toEqual({
    files: [],
    folders: [],
    others: [],
  });
  await ensureFileExists(`${sandbox}/c/c.txt`);
  expect(await readFile(`${sandbox}/c/c.txt`)).toBe("hello\nworld");
  await ensureEmptyFileExists(`${sandbox}/f/c.txt`);
  expect(await readFile(`${sandbox}/f/c.txt`)).toBe("");
  await deleteAny(`${sandbox}/d`);
  expect(
    await perFolderMatch(`${sandbox}/*`, (value) => {
      return value.slice(resolve(sandbox).length + 1);
    })
  ).toEqual(["c", "e", "f"]);
});
