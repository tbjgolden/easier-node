const CHAR_DOT = 46;
const CHAR_FORWARD_SLASH = 47;

// Resolve . and .. elements in a path with directory names
const normalizeString = (path: string) => {
  const shouldAllowAboveRoot = path.codePointAt(0) === CHAR_FORWARD_SLASH;
  let result = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      code = path.codePointAt(index) as number;
    } else if (code === CHAR_FORWARD_SLASH) {
      break;
    } else {
      code = CHAR_FORWARD_SLASH;
    }

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
          if (shouldAllowAboveRoot) {
            result += result.length > 0 ? `/..` : "..";
            lastSegmentLength = 2;
          }
        } else {
          if (result.length > 0) {
            result += `/${path.slice(lastSlash + 1, index)}`;
          } else {
            result = path.slice(lastSlash + 1, index);
          }
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

export const join = (pathA: string, pathB: string, ...extraPaths: string[]) => {
  const paths = [pathA, pathB, ...extraPaths];
  if (paths.length === 0) {
    return ".";
  }

  let joined: string | undefined;
  for (const path of paths) {
    if (path.length > 0) {
      if (joined === undefined) {
        joined = path;
      } else {
        joined += "/" + path;
      }
    }
  }

  if (joined === undefined) {
    return ".";
  }

  return normalize(joined);
};

export const resolve = (path: string, ...extraPaths: string[]) => {
  let resolvedPath = "";
  let isAbsolute = false;

  const paths = [path, ...extraPaths];
  for (let index = paths.length - 1; index >= -1 && !isAbsolute; index--) {
    const path = index >= 0 ? paths[index] : process.cwd();
    if (path.length === 0) {
      continue;
    }

    resolvedPath = path + "/" + resolvedPath;
    isAbsolute = path.codePointAt(0) === CHAR_FORWARD_SLASH;
  }

  resolvedPath = normalizeString(resolvedPath);
  if (isAbsolute) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};

export const relative = (fromPath: string, toPath: string) => {
  if (fromPath === toPath) {
    return "";
  }

  fromPath = absolute(fromPath);
  toPath = absolute(toPath);

  if (fromPath === toPath) {
    return "";
  }

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
    if (fromCode !== toPath.codePointAt(toStart + index)) {
      break;
    } else if (fromCode === CHAR_FORWARD_SLASH) {
      lastCommonSeparator = index;
    }
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

export const normalize = (path: string) => {
  if (path.length === 0) {
    return ".";
  }
  const isAbsolute = path.codePointAt(0) === CHAR_FORWARD_SLASH;
  if (isAbsolute && path.length === 1) {
    return path;
  }
  path = normalizeString(path);
  return isAbsolute ? `/${path}` : path || ".";
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

export const ensureSlash = (path: string): string => {
  return path.endsWith("/") ? path : path + "/";
};

export const absolute = (path: string): string => {
  return resolve(path);
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
