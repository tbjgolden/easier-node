import fs from "node:fs";
import { $CWD } from "./aliases";
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
            resolve((await getLastNBytes(path, 1))[0] !== 10);
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
 * listsFilesInFolder
 * */
export const listFilesInFolder = async (
  path: string,
  output: "relative" | "absolute" | "leaves" = "relative"
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
            if (output === "leaves") {
              return dirent.name;
            } else if (output === "relative") {
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
  output: "relative" | "absolute" | "leaves" = "relative"
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
            if (output === "leaves") {
              return dirent.name;
            } else if (output === "relative") {
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
 * listsFilesWithinFolder
 * */
export const listFilesWithinFolder = async (
  path: string,
  output: "relative" | "absolute" = "relative"
): Promise<string[]> => {
  const [allFiles, allFolders] = await Promise.all([
    listFilesInFolder(path, "leaves"),
    listFoldersInFolder(path, "leaves"),
  ]);

  const relativePaths = allFiles;
  const childrenFolders = await Promise.all(
    allFolders.map(async (folder): Promise<[string, string[]]> => {
      const newPath = path + "/" + folder;
      return [newPath, await listFilesWithinFolder(newPath, "relative")];
    })
  );
  for (const [childName, filesInsideChild] of childrenFolders) {
    for (const fileInsideChild of filesInsideChild) {
      relativePaths.push(childName + "/" + fileInsideChild);
    }
  }

  return relativePaths;
};
