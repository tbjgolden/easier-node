import fs from "node:fs";
import { getLastNBytes, move, trashPath } from "./filesystem.helpers";
import { JSONData, readJSON, writeJSON } from "./json";
import { getParentFolderPath, joinPaths, resolvePaths } from "./path";

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
 * get a list of the files directly inside a folder
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
 * get a list of the folders directly inside a folder
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
 * get a list of files + a list of folders that are directly inside a folder
 * */
export const listFolderContents = async (
  path: string,
  output: "absolute" | "relative-path" | "relative-cwd" = "relative-path"
): Promise<{ folders: string[]; files: string[] }> => {
  if (!(await isFolder(path))) {
    throw new Error("Path is not a directory");
  }

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
 * get a list of the files nested inside a folder or its descendant folders
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
 * get a list of the folders nested inside a folder or its descendant folders
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

const getType = async (
  path: string
): Promise<"file" | "folder" | "symlink" | "other" | "none"> => {
  return new Promise((resolve) => {
    fs.lstat(path, (error, stats) => {
      if (error) return resolve("none");
      else if (stats.isFile()) return resolve("file");
      else if (stats.isDirectory()) return resolve("folder");
      else if (stats.isSymbolicLink()) return resolve("symlink");
      else return resolve("other");
    });
  });
};

/**
 * move or rename a file to a new location
 */
export const moveFile = async (
  sourcePath: string,
  destinationPath: string,
  shouldOverwrite = true
) => {
  if (await isFile(sourcePath)) {
    await move(sourcePath, destinationPath, shouldOverwrite);
  } else {
    throw new Error("Expected sourcePath to be a file");
  }
};
/**
 * rename or move a file to a new location
 */
export const renameFile = moveFile;

/**
 * move or rename a folder to a new location
 */
export const moveFolder = async (
  sourcePath: string,
  destinationPath: string,
  shouldOverwrite = true
) => {
  if (await isFolder(sourcePath)) {
    await move(sourcePath, destinationPath, shouldOverwrite);
  } else {
    throw new Error("Expected sourcePath to be a folder");
  }
};
/**
 * rename or move a folder to a new location
 */
export const renameFolder = moveFolder;

/**
 * move a file to Trash/Recycle bin
 */
export const removeFile = async (path: string): Promise<void> => {
  return trashPath(path);
};

/**
 * move a folder to Trash/Recycle bin
 */
export const removeFolder = removeFile;

/**
 * permanently deletes everything inside a folder
 */
export const emptyFolder = async (path: string): Promise<void> => {
  if (!(await isFolder(path))) {
    throw new Error("Path is not a directory");
  }

  await new Promise<void>((resolve, reject) => {
    fs.readdir(path, { withFileTypes: true }, async (error, dirents) => {
      if (error) return reject(error);

      for (const dirent of dirents) {
        const newPath = joinPaths(path, dirent.name);
        await (dirent.isDirectory() ? deleteFolder(newPath) : deleteFile(newPath));
      }

      fs.rmdir(path, (error) => {
        if (error) return reject(error);

        return resolve();
      });
    });
  });
};

/**
 * permanently deletes a file
 */
export const deleteFile = async (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};

/**
 * permanently deletes a folder, and anything inside it
 */
export const deleteFolder = async (path: string): Promise<void> => {
  await emptyFolder(path);

  return new Promise((resolve, reject) => {
    fs.rmdir(path, (error) => {
      if (error) return reject(error);

      return resolve();
    });
  });
};

/**
 * determines if the path refers to a file or not
 */
export const isFile = async (path: string): Promise<boolean> => {
  return (await getType(path)) === "file";
};

/**
 * determines if the path refers to a folder or not
 */
export const isFolder = async (path: string): Promise<boolean> => {
  return (await getType(path)) === "folder";
};

/**
 * determines if the path refers to a symbolic link or not
 */
export const isSymlink = async (path: string): Promise<boolean> => {
  return (await getType(path)) === "symlink";
};

/**
 * is there a file, folder or something else at the specified path
 */
export const doesPathExist = async (path: string): Promise<boolean> => {
  return (await getType(path)) !== "none";
};

/**
 * tries to create a folder (will error if parent folder doesn't exist)
 */
export const createFolder = async (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
};

/**
 * ensures a folder exists at the path (creates parent folders if they don't exist)
 *
 * will error if a file already exists along or at the path
 */
export const ensureFolderExists = async (path: string): Promise<void> => {
  const wasFolder = await isFolder(path);

  if (!wasFolder) {
    return new Promise((resolve, reject) => {
      fs.mkdir(path, { recursive: true }, (error) => {
        if (error) return reject(error);
        return resolve();
      });
    });
  }
};

/**
 * ensures an empty folder exists at the path,
 * removing any folders and files that get in the way.
 *
 * permanently deletes files and folders already inside path.
 *
 * will error if a file already exists along or at the path.
 */
export const ensureEmptyFolderExists = async (path: string): Promise<void> => {
  await ensureFolderExists(path);
  await emptyFolder(path);
};

/**
 * ensures a file exists at the path (creates parent folders if they don't exist)
 *
 * will error if a file already exists along the path or a folder exists at the path
 */
export const ensureFileExists = async (path: string): Promise<void> => {
  const wasFile = await isFile(path);

  if (!wasFile) {
    await ensureEmptyFileExists(path);
  }
};

/**
 * ensures an empty file exists at the path (creates parent folders if they don't exist).
 * if the file already exists, this will overwrite the file with an empty one
 *
 * will error if a file already exists along the path or a folder exists at the path
 */
export const ensureEmptyFileExists = async (path: string): Promise<void> => {
  const parentFolderPath = getParentFolderPath(path);
  await ensureFolderExists(parentFolderPath);
  await writeFile(path, "");
};

/**
 * creates a copy of the file at sourcePath at destinationPath
 *
 * will error if destinationPath already exists
 */
export const copyFile = async (
  sourcePath: string,
  destinationPath: string
): Promise<void> => {
  await fs.promises.copyFile(sourcePath, destinationPath, fs.constants.COPYFILE_EXCL);
};

/**
 * creates a copy of the directory at sourcePath at destinationPath
 *
 * will error if destinationPath already exists
 */
export const copyFolder = async (
  sourcePath: string,
  destinationPath: string
): Promise<void> => {
  await fs.promises.cp(sourcePath, destinationPath, {
    errorOnExist: true,
    recursive: true,
    force: false,
  });
};
