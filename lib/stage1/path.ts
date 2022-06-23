const CHAR_DOT = 46;
const CHAR_FORWARD_SLASH = 47;

// Resolve . and .. elements in a path with directory names
const normalizeString = (path: string) => {
  const allowAboveRoot = path.codePointAt(0) === CHAR_FORWARD_SLASH;
  let result = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) code = path.codePointAt(index) as number;
    else if (code === CHAR_FORWARD_SLASH) break;
    else code = CHAR_FORWARD_SLASH;

    if (code === CHAR_FORWARD_SLASH) {
      if (lastSlash !== index - 1 && dots !== 1) {
        if (dots === 2) {
          if (
            result.length < 2 ||
            lastSegmentLength !== 2 ||
            result.codePointAt(result.length - 1) !== CHAR_DOT ||
            result.codePointAt(result.length - 2) !== CHAR_DOT
          ) {
            if (result.length > 2) {
              const lastSlashIndex = result.lastIndexOf("/");
              if (lastSlashIndex === -1) {
                result = "";
                lastSegmentLength = 0;
              } else {
                result = result.slice(0, lastSlashIndex);
                lastSegmentLength = result.length - 1 - result.lastIndexOf("/");
              }
              lastSlash = index;
              dots = 0;
              continue;
            } else if (result.length > 0) {
              result = "";
              lastSegmentLength = 0;
              lastSlash = index;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            result += result.length > 0 ? `/..` : "..";
            lastSegmentLength = 2;
          }
        } else {
          if (result.length > 0) result += `/${path.slice(lastSlash + 1, index)}`;
          else result = path.slice(lastSlash + 1, index);
          lastSegmentLength = index - lastSlash - 1;
        }
      }
      lastSlash = index;
      dots = 0;
    } else if (code === CHAR_DOT && dots !== -1) {
      dots += 1;
    } else {
      dots = -1;
    }
  }
  return result;
};

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
  const paths = [pathA, pathB, ...extraPaths];
  if (paths.length === 0) return ".";

  let joined: string | undefined;
  for (const path of paths) {
    if (path.length > 0) {
      if (joined === undefined) joined = path;
      else joined += "/" + path;
    }
  }

  if (joined === undefined) return ".";

  return getNormalizedPath(joined);
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
export const resolvePaths = (path: string, ...extraPaths: string[]) => {
  let resolvedPath = "";
  let resolvedAbsolute = false;

  const paths = [path, ...extraPaths];
  for (let index = paths.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? paths[index] : process.cwd();
    if (path.length === 0) continue;

    resolvedPath = path + "/" + resolvedPath;
    resolvedAbsolute = path.codePointAt(0) === CHAR_FORWARD_SLASH;
  }

  resolvedPath = normalizeString(resolvedPath);
  if (resolvedAbsolute) return `/${resolvedPath}`;
  return resolvedPath.length > 0 ? resolvedPath : ".";
};

/**
 * Identical to path.relative
 * */
export const getRelativePath = (fromPath: string, toPath: string) => {
  if (fromPath === toPath) return "";

  fromPath = resolvePaths(fromPath);
  toPath = resolvePaths(toPath);

  if (fromPath === toPath) return "";

  const fromStart = 1;
  const fromEnd = fromPath.length;
  const fromLength = fromEnd - fromStart;
  const toStart = 1;
  const toLength = toPath.length - toStart;

  const length = fromLength < toLength ? fromLength : toLength;
  let lastCommonSeparator = -1;
  let index = 0;
  for (; index < length; index++) {
    const fromCode = fromPath.codePointAt(fromStart + index);
    if (fromCode !== toPath.codePointAt(toStart + index)) break;
    else if (fromCode === CHAR_FORWARD_SLASH) lastCommonSeparator = index;
  }
  if (index === length) {
    if (toLength > length) {
      if (toPath.codePointAt(toStart + index) === CHAR_FORWARD_SLASH) {
        return toPath.slice(toStart + index + 1);
      }
      if (index === 0) {
        return toPath.slice(toStart + index);
      }
    } else if (fromLength > length) {
      if (fromPath.codePointAt(fromStart + index) === CHAR_FORWARD_SLASH) {
        lastCommonSeparator = index;
      } else if (index === 0) {
        lastCommonSeparator = 0;
      }
    }
  }

  let out = "";
  for (index = fromStart + lastCommonSeparator + 1; index <= fromEnd; ++index) {
    if (index === fromEnd || fromPath.codePointAt(index) === CHAR_FORWARD_SLASH) {
      out += out.length === 0 ? ".." : "/..";
    }
  }

  return `${out}${toPath.slice(toStart + lastCommonSeparator)}`;
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
  if (path.length === 0) return ".";
  const isAbsolute = path.codePointAt(0) === CHAR_FORWARD_SLASH;
  if (isAbsolute && path.length === 1) return path;
  path = normalizeString(path);
  return isAbsolute ? `/${path}` : path || ".";
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
