import { join, resolve, normalize } from "node:path";

/**
 * Identical to path.join:
 *
 * @example
 * // returns "a/b/c"
 * joinPaths("a", "/b/c")
 * @example
 * // returns "a/b/c"
 * joinPaths("a", "b/c")
 * */
export const joinPaths = (pathA: string, pathB: string, ...extraPaths: string[]) => {
  return join(pathA, pathB, ...extraPaths);
};

/**
 * Identical to path.resolve:
 * @example
 * // returns "/b/c"
 * resolvePaths("/a", "/b/c")
 * @example
 * // returns ensurePathEndsWithSlash($CWD()) + "a/b/c"
 * resolvePaths("a", "b/c")
 * */
export const resolvePaths = (pathA: string, pathB: string, ...extraPaths: string[]) => {
  return resolve(pathA, pathB, ...extraPaths);
};

/**
 * Identical to path.normalize:
 * @example
 * // returns "/b"
 * normalizePath("/a/../b")
 * @example
 * // returns "/a/b"
 * normalizePath("/a/./b")
 * @example
 * // returns "."
 * normalizePath("a/..")
 * */
export const normalizePath = (path: string) => {
  return normalize(path);
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
  const normalizedPath = normalizePath(path);
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
