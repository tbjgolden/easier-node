import { resolve } from "../path/path";

export const getCJSGlobals = async (importMeta: ImportMeta) => {
  const { fileURLToPath } = await import("node:url");
  const { default: module_ } = await import("node:module");
  const Module = module_ as Partial<typeof module_> | undefined;

  const __filename = fileURLToPath(importMeta.url);
  const __dirname = resolve(fileURLToPath(new URL(".", importMeta.url)));

  return {
    __dirname,
    __filename,
    require: Module?.createRequire?.(__filename) ?? global.require,
  };
};
