import fs from "node:fs";

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
