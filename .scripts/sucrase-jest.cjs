const sucrase = require("sucrase");

function process(source, filename) {
  const { code, sourceMap } = sucrase.transform(source, {
    transforms: ["typescript", "jsx", "imports", "jest"],
    sourceMapOptions: { compiledFilename: filename },
    filePath: filename,
  });
  const mapBase64 = Buffer.from(JSON.stringify(sourceMap)).toString("base64");
  const suffix = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${mapBase64}`;
  return {
    code: `${code.replace(/import\s*\.meta/g, "{url:'file://'+__filename}")}\n${suffix}`,
    map: sourceMap,
  };
}

exports.process = process;
exports.default = { process };
