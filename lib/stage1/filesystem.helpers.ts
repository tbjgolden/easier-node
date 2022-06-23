import fs from "node:fs";
import { writeFile, doesPathExist, ensureFolderExists } from "./filesystem";
import os from "node:os";
import nodePath from "node:path";
import { env, platform } from "node:process";
import { execFile } from "node:child_process";
import { uuidv4 } from "./uuid";
import { getParentFolderPath, joinPaths } from "./path";
import { getCJSGlobals } from "./commonjs";

export const getFirstNBytes = async (path: string, n: number): Promise<Uint8Array> => {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error(`Invalid n arg: ${n}`);
  }
  if (n === 0) return new Uint8Array([]);

  return new Promise((resolve, reject) => {
    // use lstat to find file
    fs.lstat(path, async (error, stats) => {
      if (error !== null) {
        return reject(error);
      } else {
        const isFile = stats.isFile();
        if (isFile) {
          if (stats.size === 0) {
            return resolve(new Uint8Array([]));
          } else {
            // get last n bytes
            const length = Math.min(stats.size, n);

            fs.open(path, "r", (error, fd) => {
              if (error) {
                return reject(error);
              } else {
                fs.read(
                  fd,
                  Buffer.alloc(length),
                  0,
                  length,
                  0,
                  (
                    _error: NodeJS.ErrnoException | null,
                    _bytesRead: number,
                    buffer: NodeJS.ArrayBufferView
                  ): void => {
                    return resolve(new Uint8Array(buffer.buffer));
                  }
                );
              }
            });
          }
        } else {
          return reject(new Error(`Expected ${path} to be a file`));
        }
      }
    });
  });
};

export const getLastNBytes = async (path: string, n: number): Promise<Uint8Array> => {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error(`Invalid n arg: ${n}`);
  }
  if (n === 0) return new Uint8Array([]);

  return new Promise((resolve, reject) => {
    // use lstat to find file
    fs.lstat(path, async (error, stats) => {
      if (error !== null) {
        return reject(error);
      } else {
        const isFile = stats.isFile();
        if (isFile) {
          if (stats.size === 0) {
            return resolve(new Uint8Array([]));
          } else {
            // get last n bytes
            const position = Math.max(0, stats.size - n);
            const length = Math.min(stats.size, n);

            fs.open(path, "r", (error, fd) => {
              if (error) {
                return reject(error);
              } else {
                fs.read(
                  fd,
                  Buffer.alloc(length),
                  0,
                  length,
                  position,
                  (
                    _error: NodeJS.ErrnoException | null,
                    _bytesRead: number,
                    buffer: NodeJS.ArrayBufferView
                  ): void => {
                    return resolve(new Uint8Array(buffer.buffer));
                  }
                );
              }
            });
          }
        } else {
          return reject(new Error(`Expected ${path} to be a file`));
        }
      }
    });
  });
};

export const trashPath = async (path: string) => {
  const { __dirname } = await getCJSGlobals(import.meta);

  await new Promise((resolve, reject) => {
    fs.lstat(path, (error) => {
      if (error !== null && error.code !== "ENOENT") {
        return reject(error);
      }
      resolve(nodePath.resolve(path));
    });
  });

  if (platform === "darwin") {
    await new Promise((resolve, reject) => {
      execFile(joinPaths(__dirname, "../assets/macos-trash"), [path], (error, stdout) => {
        return error ? reject(error) : resolve(stdout);
      });
    });
  } else {
    const trashPath = joinPaths(
      env.XDG_DATA_HOME || joinPaths(os.homedir(), ".local", "share"),
      "Trash"
    );
    const filesPath = joinPaths(trashPath, "files");
    const infoPath = joinPaths(trashPath, "info");
    await fs.promises.mkdir(filesPath, { mode: 0o700, recursive: true });
    await fs.promises.mkdir(infoPath, { mode: 0o700, recursive: true });
    const name = uuidv4();
    await writeFile(
      joinPaths(infoPath, `${name}.trashinfo`),
      `[Trash Info]\nPath=${path.replace(/\s/g, "%20")}\nDeletionDate=${new Date()
        .toISOString()
        .slice(0, 16)}`
    );
    await move(path, joinPaths(filesPath, name), true);
  }
};

export const move = async (
  sourcePath: string,
  destinationPath: string,
  shouldOverwrite: boolean
) => {
  if (!shouldOverwrite && (await doesPathExist(destinationPath))) {
    throw new Error(`Destination exists: ${destinationPath}`);
  }

  await ensureFolderExists(getParentFolderPath(destinationPath));

  await new Promise<void>((resolve, reject) => {
    fs.rename(sourcePath, destinationPath, async (error) => {
      return error === null ? resolve() : reject(error);
    });
  });
};
