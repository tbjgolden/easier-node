import { resolvePaths } from "./path";

export const getCJSGlobals = async (importMeta: ImportMeta) => {
  const { fileURLToPath } = await import("node:url");
  const { default: module_ } = await import("node:module");
  const __filename = fileURLToPath(importMeta.url);
  const __dirname = resolvePaths(fileURLToPath(new URL(".", importMeta.url)));

  return {
    __dirname,
    __filename,
    require: module_?.createRequire(__filename) ?? global.require,
  };
};
