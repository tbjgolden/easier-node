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
import { getFirstNBytes, getLastNBytes, move, trashPath } from "./file.helpers";

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

test("coverage", async () => {
  await writeFile(`${sandbox}/bytes.txt`, "0123456789");
  await writeFile(`${sandbox}/empty.txt`, "");
  await writeFile(`${sandbox}/nonreadable.txt`, "abc");
  await fs.chmod(`${sandbox}/nonreadable.txt`, 0o333);
  await fs.mkdir(`${sandbox}/dir`);
  await expect(() => getFirstNBytes(`${sandbox}/bytes.txt`, -1)).rejects.toThrow();
  expect(await getFirstNBytes(`${sandbox}/bytes.txt`, 0)).toEqual(new Uint8Array([]));
  await expect(() => getFirstNBytes(`${sandbox}/not-a-real-file`, 1)).rejects.toThrow();
  expect(await getFirstNBytes(`${sandbox}/bytes.txt`, 1)).toEqual(new Uint8Array([48]));
  expect(await getFirstNBytes(`${sandbox}/empty.txt`, 1)).toEqual(new Uint8Array([]));
  await expect(() => getFirstNBytes(`${sandbox}/nonreadable.txt`, 1)).rejects.toThrow();
  await expect(() => getFirstNBytes(`${sandbox}/dir`, 1)).rejects.toThrow();
  await expect(() => getLastNBytes(`${sandbox}/bytes.txt`, -1)).rejects.toThrow();
  expect(await getLastNBytes(`${sandbox}/bytes.txt`, 0)).toEqual(new Uint8Array([]));
  await expect(() => getLastNBytes(`${sandbox}/not-a-real-file`, 1)).rejects.toThrow();
  expect(await getLastNBytes(`${sandbox}/bytes.txt`, 1)).toEqual(new Uint8Array([57]));
  expect(await getLastNBytes(`${sandbox}/empty.txt`, 1)).toEqual(new Uint8Array([]));
  await expect(() => getLastNBytes(`${sandbox}/nonreadable.txt`, 1)).rejects.toThrow();
  await expect(() => getLastNBytes(`${sandbox}/dir`, 1)).rejects.toThrow();

  await expect(() => trashPath(`${sandbox}/notADir`)).rejects.toThrow();
  await trashPath(`${sandbox}/dir`);

  await expect(() =>
    move(`${sandbox}/bytes.txt`, `${sandbox}/empty.txt`, false)
  ).rejects.toThrow();

  await fs.mkdir(`${sandbox}/nonWritableDir`);
  await fs.chmod(`${sandbox}/nonWritableDir`, 0o555);
  await appendFile(`${sandbox}/bytes.txt`, "0");
  expect(await readFile(`${sandbox}/bytes.txt`)).toBe("01234567890");
  await appendFile(`${sandbox}/newfile.txt`, "0", true);
  expect(await readFile(`${sandbox}/newfile.txt`)).toBe("0");
  await expect(() =>
    appendFile(`${sandbox}/nonWritableDir/newfile.txt`, "0", true)
  ).rejects.toThrow();
  await expect(() =>
    appendFile(`${sandbox}/nonWritableDir`, "0", true)
  ).rejects.toThrow();

  await fs.mkdir(`${sandbox}/dir2`);
  await writeFile(`${sandbox}/dir2/a.txt`, "rawr");
  expect(await listFilesInFolder(`${sandbox}/dir2`, "absolute")).toEqual([
    process.cwd() + "/lib/__fixtures__/sandbox/dir2/a.txt",
  ]);
  expect(await listFilesInFolder(`${sandbox}/dir2`, "relative-path")).toEqual(["a.txt"]);
  expect(await listFilesInFolder(`${sandbox}/dir2`, "relative-cwd")).toEqual([
    "lib/__fixtures__/sandbox/dir2/a.txt",
  ]);

  await expect(() => listFolderContents(`${sandbox}/invalidPath`)).rejects.toThrow();
  expect((await listFolderContents(`${sandbox}/dir2`, "absolute")).files).toEqual([
    process.cwd() + "/lib/__fixtures__/sandbox/dir2/a.txt",
  ]);
  expect((await listFolderContents(`${sandbox}/dir2`, "relative-path")).files).toEqual([
    "a.txt",
  ]);
  expect((await listFolderContents(`${sandbox}/dir2`, "relative-cwd")).files).toEqual([
    "lib/__fixtures__/sandbox/dir2/a.txt",
  ]);

  expect(await listFilesWithinFolder(`${sandbox}/dir2`, "absolute")).toEqual([
    process.cwd() + "/lib/__fixtures__/sandbox/dir2/a.txt",
  ]);
  expect(await listFilesWithinFolder(`${sandbox}/dir2`, "relative-path")).toEqual([
    "a.txt",
  ]);
  expect(await listFilesWithinFolder(`${sandbox}/dir2`, "relative-cwd")).toEqual([
    "lib/__fixtures__/sandbox/dir2/a.txt",
  ]);

  await fs.mkdir(`${sandbox}/dir2/b`);
  expect(await listFoldersWithinFolder(`${sandbox}/dir2`, "absolute")).toEqual([
    process.cwd() + "/lib/__fixtures__/sandbox/dir2/b",
  ]);
  expect(await listFoldersWithinFolder(`${sandbox}/dir2`, "relative-path")).toEqual([
    "b",
  ]);
  expect(await listFoldersWithinFolder(`${sandbox}/dir2`, "relative-cwd")).toEqual([
    "lib/__fixtures__/sandbox/dir2/b",
  ]);

  await expect(moveFile(`${sandbox}/dir2/b`, `${sandbox}/dir2/c`)).rejects.toThrow();
  await expect(
    moveFolder(`${sandbox}/dir2/a.txt`, `${sandbox}/dir2/d`)
  ).rejects.toThrow();

  await expect(emptyFolder(`${sandbox}/dir2/a.txt`)).rejects.toThrow();
  await fs.symlink("baa", `${sandbox}/dir2/symlink`);
  await fs.mkdir(`${sandbox}/dir2/dir3`);
  await emptyFolder(`${sandbox}/dir2`);

  await ensureFileExists(`${sandbox}/dir2/new.txt`);

  await fs.mkdir(`${sandbox}/dir2/dir3`);
  await copyFolderContentsToFolder(`${sandbox}/dir2`, `${sandbox}/dir2.1`);
  expect(await readFile(`${sandbox}/dir2.1/new.txt`)).toBe("");
});
