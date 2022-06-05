import fs from "node:fs";
import { getLastNBytes } from "./filesystem.helpers";
import { JSONData, readJSON, writeJSON } from "./json";
import { joinPaths, resolvePaths } from "./path";

/**
 * same as fs.readFile, but assumes the file is a UTF8 string
 * instead of a Buffer. For other uses, use fs directly.
 * @example
 * // returns "html, body, div, span, [...]"
 * await readFile("./reset.css")
 * */
export const readFile = async (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (error, string) => {
      if (error) return reject(error);
      return resolve(string);
    });
  });
};

/**
 * shortcut for readFile + readJSON
 * (can read JSON with Comments)
 * @example
 * // returns { version: "1.0.0", ... }
 * await readJSONFile("package.json")
 * */
export const readJSONFile = async (path: string): Promise<string> => {
  return readJSON(await readFile(path));
};

/**
 * similar to fs.writeFile, but simpler and returns a Promise.
 * Will overwrite.
 * For other uses, use fs directly.
 * @example
 * await writeFile("./reset.css", "html, body, div, span, [...]")
 * */
export const writeFile = async (path: string, newFileString: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, newFileString, (error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
};

/**
 * shortcut for writeJSON + writeFile
 * Will overwrite.
 * For other uses, use fs directly.
 * @example
 * await writeJSONFile("package.json", { version: "1.0.0", ... })
 * */
export const writeJSONFile = async <T extends JSONData>(
  path: string,
  data: T
): Promise<void> => {
  return await writeFile(path, writeJSON(data));
};

/**
 * similar to fs.appendFile, but simpler and returns a Promise.
 * For other uses, use fs directly.
 *
 * @param shouldAddNewLineIfNeeded add a new line, unless either...
 *  - the file already ends with one
 *  - the file is empty
 *  - the file doesn't exist
 * @example
 * await appendFile("./file.css", ".red {\n  color: red;\n}", true)
 * */
export const appendFile = async (
  path: string,
  stringToAppend: string,
  shouldAddNewLineIfNeeded = false
): Promise<void> => {
  if (shouldAddNewLineIfNeeded) {
    const needsNewLine = await new Promise((resolve, reject) => {
      fs.lstat(path, async (error, stats) => {
        const errorCode = error?.code;
        if (typeof errorCode === "string" && errorCode === "ENOENT") {
          try {
            await writeFile(path, "");
            return resolve(false);
          } catch (error) {
            return reject(error);
          }
        } else if (error !== null) {
          return reject(error);
        } else {
          const isFile = stats.isFile();
          if (isFile) {
            const lastByte: number | undefined = (await getLastNBytes(path, 1))[0];
            resolve(lastByte !== undefined && lastByte !== 10);
          } else {
            reject(new Error(`Expected ${path} to be a file`));
          }
        }
        resolve(false);
      });
    });
    if (needsNewLine) {
      stringToAppend = "\n" + stringToAppend;
    }
  }

  return new Promise((resolve, reject) => {
    fs.appendFile(path, stringToAppend, (error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
};
/**
 * listFilesInFolder
 * */
export const listFilesInFolder = async (
  path: string,
  output: "absolute" | "relative-path" | "relative-cwd" = "relative-path"
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, { withFileTypes: true }, (error, dirents) => {
      if (error) return reject(error);
      return resolve(
        dirents
          .filter((dirent) => {
            return dirent.isFile();
          })
          .map((dirent) => {
            if (output === "relative-path") {
              return dirent.name;
            } else if (output === "relative-cwd") {
              return joinPaths(path, dirent.name);
            } else {
              return resolvePaths(path, dirent.name);
            }
          })
      );
    });
  });
};

/**
 * listFoldersInFolder
 * */
export const listFoldersInFolder = async (
  path: string,
  output: "absolute" | "relative-path" | "relative-cwd" = "relative-path"
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, { withFileTypes: true }, (error, dirents) => {
      if (error) return reject(error);
      return resolve(
        dirents
          .filter((dirent) => {
            return dirent.isDirectory();
          })
          .map((dirent) => {
            if (output === "relative-path") {
              return dirent.name;
            } else if (output === "relative-cwd") {
              return joinPaths(path, dirent.name);
            } else {
              return resolvePaths(path, dirent.name);
            }
          })
      );
    });
  });
};

/**
 * listFolderContents
 * */
export const listFolderContents = async (
  path: string,
  output: "absolute" | "relative-path" | "relative-cwd" = "relative-path"
): Promise<{ folders: string[]; files: string[] }> => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, { withFileTypes: true }, (error, dirents) => {
      if (error) return reject(error);

      const result: { folders: string[]; files: string[] } = { folders: [], files: [] };

      for (const dirent of dirents) {
        let listKey: "files" | "folders" | undefined;
        if (dirent.isFile()) listKey = "files";
        else if (dirent.isDirectory()) listKey = "folders";

        if (listKey !== undefined) {
          if (output === "relative-path") {
            result[listKey].push(dirent.name);
          } else if (output === "relative-cwd") {
            result[listKey].push(joinPaths(path, dirent.name));
          } else {
            result[listKey].push(resolvePaths(path, dirent.name));
          }
        }
      }

      return resolve(result);
    });
  });
};

/**
 * listFilesWithinFolder
 * */
export const listFilesWithinFolder = async (
  path: string,
  output: "absolute" | "relative-path" | "relative-cwd" = "relative-path"
): Promise<string[]> => {
  const results = await recursiveListFilesWithinFolder(path);
  if (output === "absolute") {
    return results.map((result) => {
      return resolvePaths(path, result);
    });
  } else if (output === "relative-cwd") {
    return results.map((result) => {
      return joinPaths(path, result);
    });
  } else {
    return results;
  }
};
const recursiveListFilesWithinFolder = async (path: string): Promise<string[]> => {
  const [files, folders] = await Promise.all([
    listFilesInFolder(path),
    listFoldersInFolder(path),
  ]);

  const descendants = (
    await Promise.all(
      folders.map(async (name) => {
        const within = await recursiveListFilesWithinFolder(path + "/" + name);
        return within.map((child) => {
          return name + "/" + child;
        });
      })
    )
  ).flat();

  return [...files, ...descendants];
};

/**
 * listFoldersWithinFolder
 * */
export const listFoldersWithinFolder = async (
  path: string,
  output: "absolute" | "relative-path" | "relative-cwd" = "relative-path"
): Promise<string[]> => {
  const results = await recursiveListFoldersWithinFolder(path);
  if (output === "absolute") {
    return results.map((result) => {
      return resolvePaths(path, result);
    });
  } else if (output === "relative-cwd") {
    return results.map((result) => {
      return joinPaths(path, result);
    });
  } else {
    return results;
  }
};
const recursiveListFoldersWithinFolder = async (path: string): Promise<string[]> => {
  const folders = await listFoldersInFolder(path);

  const descendants = (
    await Promise.all(
      folders.map(async (name) => {
        const within = await recursiveListFoldersWithinFolder(path + "/" + name);
        return within.map((child) => {
          return name + "/" + child;
        });
      })
    )
  ).flat();

  return [...folders, ...descendants];
};
