import { ensureSlash, normalize } from "../path/path";
import { escape } from "../regu/regu";

const GLOBSTAR_REGEX = /(^|\/)\\\*\\\*(?:\/|$)/;
const WILDCARD_REGEX = /\\\*/;
const SET_REGEX = /\\{(.*)?(\\})/;

export const toRegex = (glob: string, basePath = process.cwd()): RegExp => {
  // features:
  // relative / absolute based on start of glob
  const isAbsolute = glob.startsWith("/");
  let regexSource = escape(normalize(glob));
  // ** = globstar (must not have adjacent char besides a /)
  let globstarMatch = regexSource.match(GLOBSTAR_REGEX);
  while (globstarMatch !== null) {
    const index = globstarMatch.index;
    if (index === undefined) {
      break;
    } else {
      regexSource =
        regexSource.slice(0, index) +
        globstarMatch[1] +
        ".*" +
        regexSource.slice(index + globstarMatch[0].length);
      globstarMatch = regexSource.match(GLOBSTAR_REGEX);
    }
  }
  // * = wildcard
  let wildcardMatch = regexSource.match(WILDCARD_REGEX);
  while (wildcardMatch !== null) {
    const index = wildcardMatch.index;
    if (index === undefined) {
      break;
    } else {
      regexSource =
        regexSource.slice(0, index) +
        "[^/]*" +
        regexSource.slice(index + wildcardMatch[0].length);
      wildcardMatch = regexSource.match(WILDCARD_REGEX);
    }
  }
  // {,} = set
  let setMatch = regexSource.match(SET_REGEX);
  while (setMatch !== null) {
    const index = setMatch.index;
    if (index === undefined) {
      break;
    } else {
      regexSource =
        regexSource.slice(0, index) +
        "(?:" +
        setMatch[1].replaceAll(",", "|") +
        ")" +
        regexSource.slice(index + setMatch[0].length);
      setMatch = regexSource.match(SET_REGEX);
    }
  }

  return new RegExp(
    "^" + (isAbsolute ? "" : escape(ensureSlash(normalize(basePath)))) + regexSource + "$"
  );
};
