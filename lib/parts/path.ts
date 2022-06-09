import nodePath from "node:path";

/**
 * Identical to path.join:
 * @example
 * // returns "a/b/c"
 * joinPaths("a", "/b/c")
 * @example
 * // returns "a/b/c"
 * joinPaths("a", "b/c")
 * */
export const joinPaths = (pathA: string, pathB: string, ...extraPaths: string[]) => {
  return nodePath.join(pathA, pathB, ...extraPaths);
};

/**
 * Identical to path.resolve:
 * @example
 * // returns "/b/c"
 * resolvePaths("/a", "/b/c")
 * @example
 * // returns ensurePathEndsWithSlash(process.cwd()) + "a/b/c"
 * resolvePaths("a", "b/c")
 * */
export const resolvePaths = (pathA: string, pathB: string, ...extraPaths: string[]) => {
  return nodePath.resolve(pathA, pathB, ...extraPaths);
};

/**
 * Identical to path.relative
 * */
export const getRelativePath = (fromPath: string, toPath: string) => {
  return nodePath.relative(fromPath, toPath);
};

/**
 * Identical to path.normalize (for normalized absolute paths, use getAbsolutePath):
 * @example
 * // returns "/b"
 * getNormalizedPath("/a/../b")
 * @example
 * // returns "/a/b"
 * getNormalizedPath("/a/./b")
 * @example
 * // returns "."
 * getNormalizedPath("a/..")
 * */
export const getNormalizedPath = (path: string) => {
  return nodePath.normalize(path);
};

/**
 * Splits path into parts:
 * @example
 * // returns ["hello", "world"]
 * splitPath("/hello/world")
 * @example
 * // returns []
 * splitPath("/")
 * */
export const splitPath = (path: string) => {
  const normalizedPath = getNormalizedPath(path);
  const parts = normalizedPath.split("/");
  return parts.filter((part) => {
    return part !== "" && part !== ".";
  });
};

/**
 * Gets the extension from the final complete part of the path
 * @example
 * // returns ""
 * getExtension("/hello/world")
 * @example
 * // returns ".png"
 * getExtension("/hello/world.png")
 * @example
 * // returns ""
 * getExtension("/a.dir.with.dots/world")
 * @example
 * // returns ".dots"
 * getExtension("/a.dir.with.dots/")
 */
export const getExtension = (path: string): string => {
  const parts = splitPath(path);
  if (parts.length === 0) {
    return "";
  } else {
    const lastPart = parts[parts.length - 1];
    const lastIndexOfDot = lastPart.lastIndexOf(".");
    return lastIndexOfDot === -1 ? "" : lastPart.slice(lastIndexOfDot);
  }
};

/**
 * Gets the extension from the final complete part of the path
 * @example
 * // returns "/hello/world/"
 * ensurePathEndsWithSlash("/hello/world")
 * @example
 * // returns "/hello/world/"
 * ensurePathEndsWithSlash("/hello/world/")
 * @example
 * // returns "/"
 * ensurePathEndsWithSlash("/")
 */
export const ensurePathEndsWithSlash = (path: string): string => {
  return path.endsWith("/") ? path : path + "/";
};

/**
 * converts the path to a normalized absolute path
 * @example
 * // returns ensurePathEndsWithSlash(process.cwd()) + "hello/world/"
 * getAbsolutePath("hello/world")
 */
export const getAbsolutePath = (path: string): string => {
  return resolvePaths(process.cwd(), path);
};

/**
 * get the normalized absolute path of the parent folder
 * @example
 * // returns ensurePathEndsWithSlash(process.cwd()) + "hello"
 * getParentFolderPath("hello/world")
 */
export const getParentFolderPath = (path: string): string => {
  const absolutePath = getAbsolutePath(path);

  if (absolutePath === "/") throw new Error("Can't get parent of /");

  return joinPaths(absolutePath, "..");
};
