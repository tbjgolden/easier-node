import fs, { Dirent } from "node:fs";
import readline from "node:readline";

import { globToRegex } from "../glob/glob";
import { JSONData, readJSON, writeJSON } from "../json/json";
import {
  getParentFolderPath,
  getRelativePath,
  joinPaths,
  resolvePaths,
} from "../path/path";
import { getLastNBytes, move, trashPath } from "./filesystem.helpers";

/**
 * same as fs.readFile, but assumes the file is a UTF8 string
 * instead of a Buffer. For other uses, use fs directly.
 * @example
 * // returns "html, body, div, span, [...]"
 * await readFile("./reset.css")
 * */
export const readFile = async (path: string): Promise<string> => {
  return fs.promises.readFile(path, "utf8");
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
  return fs.promises.writeFile(path, newFileString);
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
        } else if (error) {
          return reject(error);
        } else {
          const isFile = stats.isFile();
          if (isFile) {
            const lastByteArray = await getLastNBytes(path, 1);
            const lastByte = lastByteArray.length > 0 ? lastByteArray[0] : undefined;
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

  return fs.promises.appendFile(path, stringToAppend);
};

type Output = "absolute" | "relative-path" | "relative-cwd";
const filterInFolder = async (
  path: string,
  output: Output,
  filterFunction = (_dirent: Dirent) => {
    return true;
  }
): Promise<string[]> => {
  const dirents = await fs.promises.readdir(path, { withFileTypes: true });
  // eslint-disable-next-line unicorn/no-array-callback-reference
  return dirents.filter(filterFunction).map((dirent) => {
    if (output === "relative-path") {
      return dirent.name;
    } else if (output === "relative-cwd") {
      return joinPaths(path, dirent.name);
    } else {
      return resolvePaths(path, dirent.name);
    }
  });
};

/**
 * get a list of the files directly inside a folder
 * */
export const listFilesInFolder = async (
  path: string,
  output: Output = "relative-path"
): Promise<string[]> => {
  return filterInFolder(path, output, (dirent) => {
    return dirent.isFile();
  });
};

/**
 * get a list of the folders directly inside a folder
 * */
export const listFoldersInFolder = async (
  path: string,
  output: Output = "relative-path"
): Promise<string[]> => {
  return filterInFolder(path, output, (dirent) => {
    return dirent.isDirectory();
  });
};

/**
 * get a list of files + a list of folders that are directly inside a folder
 * */
export const listFolderContents = async (
  path: string,
  output: Output = "relative-path"
) => {
  if (!(await isFolder(path))) {
    throw new Error("Path is not a directory");
  }

  const folders: string[] = [];
  const files: string[] = [];
  const others: string[] = [];

  for (const dirent of await fs.promises.readdir(path, { withFileTypes: true })) {
    let subPath = dirent.name;
    if (output === "relative-cwd") {
      subPath = getRelativePath(process.cwd(), joinPaths(path, dirent.name));
    } else if (output === "absolute") {
      subPath = resolvePaths(path, dirent.name);
    }

    if (dirent.isFile()) {
      files.push(subPath);
    } else if (dirent.isDirectory()) {
      folders.push(subPath);
    } else {
      others.push(subPath);
    }
  }

  return { folders, files, others };
};

/**
 * get a list of the files nested inside a folder or its descendant folders
 * */
export const listFilesWithinFolder = async (
  path: string,
  output: Output = "relative-path"
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

  const nestedDescendants = await Promise.all(
    folders.map(async (name) => {
      const within = await recursiveListFilesWithinFolder(path + "/" + name);
      return within.map((child) => {
        return name + "/" + child;
      });
    })
  );

  return [...files, ...nestedDescendants.flat()];
};

/**
 * get a list of the folders nested inside a folder or its descendant folders
 * */
export const listFoldersWithinFolder = async (
  path: string,
  output: Output = "relative-path"
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

  const nestedDescendants = await Promise.all(
    folders.map(async (name) => {
      const within = await recursiveListFoldersWithinFolder(path + "/" + name);
      return within.map((child) => {
        return name + "/" + child;
      });
    })
  );

  return [...folders, ...nestedDescendants.flat()];
};

const getType = async (
  path: string
): Promise<"file" | "folder" | "symlink" | "other" | "none"> => {
  return new Promise((resolve) => {
    fs.lstat(path, (error, stats) => {
      if (error) {
        return resolve("none");
      } else if (stats.isFile()) {
        return resolve("file");
      } else if (stats.isDirectory()) {
        return resolve("folder");
      } else if (stats.isSymbolicLink()) {
        return resolve("symlink");
      } else {
        return resolve("other");
      }
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
export const removeAny = removeFile;

/**
 * permanently deletes everything inside a folder
 */
export const emptyFolder = async (path: string): Promise<void> => {
  if (!(await isFolder(path))) {
    throw new Error("Path is not a folder");
  }

  const { files, folders, others } = await listFolderContents(path, "relative-cwd");
  await Promise.all([
    ...files.map((file) => {
      return deleteFile(file);
    }),
    ...others.map((other) => {
      return deleteFile(other);
    }),
    ...folders.map((folder) => {
      return deleteFolder(folder);
    }),
  ]);
};

/**
 * permanently deletes a file
 */
export const deleteFile = async (path: string): Promise<void> => {
  return fs.promises.unlink(path);
};

/**
 * permanently deletes a folder, and anything inside it
 */
export const deleteFolder = async (path: string): Promise<void> => {
  return fs.promises.rm(path, { recursive: true });
};

/**
 * permanently deletes anything at the path
 */
export const deleteAny = async (path: string): Promise<void> => {
  await ((await isFolder(path)) ? deleteFolder(path) : fs.promises.unlink(path));
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
 * determines if the path refers to an empty folder or not
 */
export const isEmptyFolder = async (path: string): Promise<boolean> => {
  return (await isFolder(path)) && (await fs.promises.readdir(path)).length === 0;
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
  return fs.promises.mkdir(path);
};

/**
 * ensures a folder exists at the path (creates parent folders if they don't exist)
 *
 * will error if a file already exists along or at the path
 */
export const ensureFolderExists = async (path: string): Promise<void> => {
  if (!(await isFolder(path))) {
    await fs.promises.mkdir(path, { recursive: true });
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
  const isAlreadyAFile = await isFile(path);

  if (!isAlreadyAFile) {
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
  destinationPath: string,
  shouldReplace = false
): Promise<void> => {
  await fs.promises.copyFile(
    sourcePath,
    destinationPath,
    shouldReplace ? fs.constants.COPYFILE_FICLONE : fs.constants.COPYFILE_EXCL
  );
};

/**
 * creates a copy of the folder and anything inside at sourcePath at destinationPath
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

/**
 * copies the contents of the folder at sourcePath into the folder at destinationPath
 */
export const copyFolderContentsToFolder = async (
  sourcePath: string,
  destinationPath: string,
  shouldReplaceFiles = false
): Promise<void> => {
  await ensureFolderExists(destinationPath);
  const { folders, files } = await listFolderContents(sourcePath);
  await Promise.all([
    ...folders.map(async (folder) => {
      await copyFolderContentsToFolder(
        joinPaths(sourcePath, folder),
        joinPaths(destinationPath, folder),
        shouldReplaceFiles
      );
    }),
    ...files.map(async (file) => {
      await copyFile(
        joinPaths(sourcePath, file),
        joinPaths(destinationPath, file),
        shouldReplaceFiles
      );
    }),
  ]);
};

/**
 * gets a files size in bytes
 */
export const getFileBytes = async (path: string): Promise<number> => {
  const stats = await fs.promises.lstat(path);
  return stats.size;
};

/**
 * gets the date a file was created
 */
export const getFileCreatedDate = async (path: string): Promise<Date> => {
  const stats = await fs.promises.lstat(path);
  return new Date(stats.birthtimeMs);
};

/**
 * gets the date a file was changed
 *
 * note: a file that is moved or renamed is not considered changed
 */
export const getFileLastChangeDate = async (path: string): Promise<Date> => {
  const stats = await fs.promises.lstat(path);
  return new Date(stats.mtimeMs);
};

/**
 *
 */
export const perFileMatch = async <T>(
  globString: string,
  perMatchFunction: ((matchPath: string) => T) | ((matchPath: string) => Promise<T>),
  basePath = process.cwd()
): Promise<T[]> => {
  const filesWithinFolder = await listFilesWithinFolder(basePath, "absolute");
  const regex = globToRegex(globString, basePath);

  return Promise.all(
    filesWithinFolder
      .filter((filePath) => {
        return regex.test(filePath);
      })
      .map(async (filePath) => {
        return perMatchFunction(filePath);
      })
  );
};

/**
 *
 */
export const perFolderMatch = async <T>(
  globString: string,
  perMatchFunction: ((matchPath: string) => T) | ((matchPath: string) => Promise<T>),
  basePath = process.cwd()
): Promise<T[]> => {
  const foldersWithinFolder = await listFoldersWithinFolder(basePath, "absolute");
  const regex = globToRegex(globString, basePath);

  return Promise.all(
    foldersWithinFolder
      .filter((filePath) => {
        return regex.test(filePath);
      })
      .map(async (filePath) => {
        return perMatchFunction(filePath);
      })
  );
};

/**
 *
 */
export const perLine = async <T>(
  path: string,
  processLineFunction: (line: string) => T | Promise<T>
): Promise<Array<Exclude<T, undefined>>> => {
  const fileStream = fs.createReadStream(path);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Number.POSITIVE_INFINITY,
  });

  const results: Array<Exclude<T, undefined>> = [];
  for await (const line of rl) {
    const result: T = await processLineFunction(line);
    if (result !== undefined) {
      results.push(result as Exclude<T, undefined>);
    }
  }
  return results;
};
