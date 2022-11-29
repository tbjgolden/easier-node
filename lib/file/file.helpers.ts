import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import nodePath from "node:path";
import { env, platform } from "node:process";

import { getCJSGlobals } from "../__internal__/commonjs";
import { join, up } from "../path/path";
import { uuidv4 } from "../uuid/uuid";
import { doesPathExist, ensureFolderExists, writeFile } from "./file";

export const getFirstNBytes = async (path: string, n: number): Promise<Uint8Array> => {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error(`Invalid n arg: ${n}`);
  }
  if (n === 0) {
    return new Uint8Array([]);
  }

  return new Promise((resolve, reject) => {
    // use lstat to find file
    fs.lstat(path, async (error, stats) => {
      if (error) {
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
  if (n === 0) {
    return new Uint8Array([]);
  }

  return new Promise((resolve, reject) => {
    // use lstat to find file
    fs.lstat(path, async (error, stats) => {
      if (error) {
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
  await new Promise((resolve, reject) => {
    fs.lstat(path, (error) => {
      if (error !== null && error.code !== "ENOENT") {
        return reject(error);
      }
      resolve(nodePath.resolve(path));
    });
  });

  if (platform === "darwin") {
    const { __dirname } = await getCJSGlobals(import.meta);
    await new Promise((resolve, reject) => {
      execFile(
        join(__dirname, "../__internal__/macos-trash"),
        [path],
        (error, stdout) => {
          return error ? reject(error) : resolve(stdout);
        }
      );
    });
  } else {
    const trashPath = join(
      env.XDG_DATA_HOME ?? join(os.homedir(), ".local", "share"),
      "Trash"
    );
    const filesPath = join(trashPath, "files");
    const infoPath = join(trashPath, "info");
    await fs.promises.mkdir(filesPath, { mode: 0o700, recursive: true });
    await fs.promises.mkdir(infoPath, { mode: 0o700, recursive: true });
    const name = uuidv4();
    await writeFile(
      join(infoPath, `${name}.trashinfo`),
      `[Trash Info]\nPath=${path.replace(/\s/g, "%20")}\nDeletionDate=${new Date()
        .toISOString()
        .slice(0, 16)}`
    );
    await move(path, join(filesPath, name), true);
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

  await ensureFolderExists(up(destinationPath));

  await new Promise<void>((resolve, reject) => {
    fs.rename(sourcePath, destinationPath, async (error) => {
      return error === null ? resolve() : reject(error);
    });
  });
};
