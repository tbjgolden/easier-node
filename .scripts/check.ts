import fs from "node:fs";

const libDirs = [...fs.readdirSync("lib", { withFileTypes: true })].filter((entry) =>
  entry.isDirectory()
);

console.log(libDirs);
