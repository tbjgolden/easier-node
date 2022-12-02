import path from "node:path";

const { posix } = path;

export const join = (pathA: string, pathB: string, ...extraPaths: string[]) => {
  return ensureNoSlash(posix.join(pathA, pathB, ...extraPaths));
};

export const resolve = (path: string, ...extraPaths: string[]) => {
  return ensureNoSlash(posix.resolve(path, ...extraPaths));
};

export const relative = (fromPath: string, toPath: string) => {
  return ensureNoSlash(posix.relative(fromPath, toPath));
};
export const absolute = (path: string): string => {
  return resolve(path);
};

export const normalize = (path: string) => {
  return ensureNoSlash(posix.normalize(path));
};

export const split = (path: string) => {
  const normalizedPath = normalize(path);
  const parts = normalizedPath.split("/");
  return parts.filter((part) => {
    return part !== "" && part !== ".";
  });
};

export const extension = (path: string, maxDotsInExtension = 1): string => {
  const parts = split(path);
  if (parts.length === 0) {
    return "";
  } else {
    const lastPart = parts[parts.length - 1];
    if (lastPart.includes(".")) {
      let lastIndexOfDot = Number.POSITIVE_INFINITY;
      for (let i = 0; i < maxDotsInExtension; i++) {
        const nextLastIndexOfDot = lastPart.lastIndexOf(".", lastIndexOfDot - 1);
        if (nextLastIndexOfDot === -1) {
          break;
        } else {
          lastIndexOfDot = nextLastIndexOfDot;
        }
      }
      return lastPart.slice(lastIndexOfDot);
    } else {
      return "";
    }
  }
};

export const ensureNoSlash = (path: string, shouldRemoveRootSlash = false): string => {
  let trailingSlashStartIndex = 1;
  for (let i = path.length - 1; i >= 1; i--) {
    if (path[i] !== "/") {
      trailingSlashStartIndex = i + 1;
      break;
    }
  }
  const newPath = path.slice(0, trailingSlashStartIndex);
  if (newPath === "/") {
    return shouldRemoveRootSlash ? "" : newPath;
  } else {
    return newPath;
  }
};

export const ensureSlash = (path: string): string => {
  return path.endsWith("/") ? path : path + "/";
};

export const up = (path: string, throwIfRoot = false): string => {
  const absolutePath = absolute(path);
  if (absolutePath === "/") {
    if (throwIfRoot) {
      throw new Error("Can't get parent of /");
    } else {
      return "/";
    }
  }
  return join(absolutePath, "..");
};
