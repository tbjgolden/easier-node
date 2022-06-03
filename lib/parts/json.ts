import { removeJSONComments } from "../bundled/remove-json-comments";
export { removeJSONComments } from "../bundled/remove-json-comments";

export type JSONPrimitive = string | number | boolean | null;

/** Deliberately does not allow primitives at the top level */
export type JSONData =
  | {
      [key: string]: JSONData | JSONPrimitive;
    }
  | Array<JSONData | JSONPrimitive>;

/**
 * same as JSON.parse, but reads comments
 * @example
 * // returns { "unicorn": "cake" }
 * readJSON(`{
 *   // Rainbows
 *   "unicorn": "cake"
 * }`)
 * */
export const readJSON = <T = unknown>(jsonString: string): T => {
  return JSON.parse(removeJSONComments(jsonString));
};

/**
 * same as JSON.stringify
 * @example
 * // returns "{\"unicorn\":\"cake\"}"
 * writeJSON({
 *   // Rainbows
 *   "unicorn": "cake"
 * })
 * */
export const writeJSON = <T extends JSONData>(jsonString: T): string => {
  return JSON.stringify(jsonString);
};
