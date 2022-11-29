import fs, { Dirent } from "node:fs";
import readline from "node:readline";

import { toRegex } from "../glob/glob";
import { JSONData, parse, stringify } from "../json/json";
import { join, relative, resolve, up } from "../path/path";
import { getLastNBytes, move, trashPath } from "./file.helpers";

export const readFile = async (path: string): Promise<string> => {
  return fs.promises.readFile(path, "utf8");
};

export const readJSONFile = async (path: string): Promise<string> => {
  return parse(await readFile(path));
};

export const writeFile = async (path: string, newFileString: string): Promise<void> => {
  return fs.promises.writeFile(path, newFileString);
};

export const writeJSONFile = async <T extends JSONData>(
  path: string,
  data: T
): Promise<void> => {
  return await writeFile(path, stringify(data));
};

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
      return join(path, dirent.name);
    } else {
      return resolve(path, dirent.name);
    }
  });
};

export const listFilesInFolder = async (
  path: string,
  output: Output = "relative-path"
): Promise<string[]> => {
  return filterInFolder(path, output, (dirent) => {
    return dirent.isFile();
  });
};

export const listFoldersInFolder = async (
  path: string,
  output: Output = "relative-path"
): Promise<string[]> => {
  return filterInFolder(path, output, (dirent) => {
    return dirent.isDirectory();
  });
};

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
      subPath = relative(process.cwd(), join(path, dirent.name));
    } else if (output === "absolute") {
      subPath = resolve(path, dirent.name);
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

export const listFilesWithinFolder = async (
  path: string,
  output: Output = "relative-path"
): Promise<string[]> => {
  const results = await recursiveListFilesWithinFolder(path);
  if (output === "absolute") {
    return results.map((result) => {
      return resolve(path, result);
    });
  } else if (output === "relative-cwd") {
    return results.map((result) => {
      return join(path, result);
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

export const listFoldersWithinFolder = async (
  path: string,
  output: Output = "relative-path"
): Promise<string[]> => {
  const results = await recursiveListFoldersWithinFolder(path);
  if (output === "absolute") {
    return results.map((result) => {
      return resolve(path, result);
    });
  } else if (output === "relative-cwd") {
    return results.map((result) => {
      return join(path, result);
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

export const renameFile = moveFile;

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

export const renameFolder = moveFolder;

export const removeFile = async (path: string): Promise<void> => {
  return trashPath(path);
};

export const removeAny = removeFile;

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

export const deleteFile = async (path: string): Promise<void> => {
  return fs.promises.unlink(path);
};

export const deleteFolder = async (path: string): Promise<void> => {
  return fs.promises.rm(path, { recursive: true });
};

export const deleteAny = async (path: string): Promise<void> => {
  await ((await isFolder(path)) ? deleteFolder(path) : fs.promises.unlink(path));
};

export const isFile = async (path: string): Promise<boolean> => {
  return (await getType(path)) === "file";
};

export const isFolder = async (path: string): Promise<boolean> => {
  return (await getType(path)) === "folder";
};

export const isEmptyFolder = async (path: string): Promise<boolean> => {
  return (await isFolder(path)) && (await fs.promises.readdir(path)).length === 0;
};

export const isSymlink = async (path: string): Promise<boolean> => {
  return (await getType(path)) === "symlink";
};

export const doesPathExist = async (path: string): Promise<boolean> => {
  return (await getType(path)) !== "none";
};

export const createFolder = async (path: string): Promise<void> => {
  return fs.promises.mkdir(path);
};

export const ensureFolderExists = async (path: string): Promise<void> => {
  if (!(await isFolder(path))) {
    await fs.promises.mkdir(path, { recursive: true });
  }
};

export const ensureEmptyFolderExists = async (path: string): Promise<void> => {
  await ensureFolderExists(path);
  await emptyFolder(path);
};

export const ensureFileExists = async (path: string): Promise<void> => {
  const isAlreadyAFile = await isFile(path);

  if (!isAlreadyAFile) {
    await ensureEmptyFileExists(path);
  }
};

export const ensureEmptyFileExists = async (path: string): Promise<void> => {
  const parentFolderPath = up(path);
  await ensureFolderExists(parentFolderPath);
  await writeFile(path, "");
};

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
        join(sourcePath, folder),
        join(destinationPath, folder),
        shouldReplaceFiles
      );
    }),
    ...files.map(async (file) => {
      await copyFile(
        join(sourcePath, file),
        join(destinationPath, file),
        shouldReplaceFiles
      );
    }),
  ]);
};

export const getFileBytes = async (path: string): Promise<number> => {
  const stats = await fs.promises.lstat(path);
  return stats.size;
};

export const getFileCreatedDate = async (path: string): Promise<Date> => {
  const stats = await fs.promises.lstat(path);
  return new Date(stats.birthtimeMs);
};

export const getFileLastChangeDate = async (path: string): Promise<Date> => {
  const stats = await fs.promises.lstat(path);
  return new Date(stats.mtimeMs);
};

export const perFileMatch = async <T>(
  globString: string,
  perMatchFunction: ((matchPath: string) => T) | ((matchPath: string) => Promise<T>),
  basePath = process.cwd()
): Promise<T[]> => {
  const filesWithinFolder = await listFilesWithinFolder(basePath, "absolute");
  const regex = toRegex(globString, basePath);

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

export const perFolderMatch = async <T>(
  globString: string,
  perMatchFunction: ((matchPath: string) => T) | ((matchPath: string) => Promise<T>),
  basePath = process.cwd()
): Promise<T[]> => {
  const foldersWithinFolder = await listFoldersWithinFolder(basePath, "absolute");
  const regex = toRegex(globString, basePath);

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
