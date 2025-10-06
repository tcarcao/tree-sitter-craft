const path = require("node:path");
const fs = require("node:fs");

const root = path.join(__dirname, "..", "..");

const binding = typeof process.versions.bun === "string"
  // Support `bun build --compile` by being statically analyzable enough to find the .node file at build-time
  ? require(`${root}/prebuilds/${process.platform}-${process.arch}/tree-sitter-craft.node`)
  : require("node-gyp-build")(root);

try {
  const nodeTypesPath = path.join(root, "src", "node-types.json");
  if (fs.existsSync(nodeTypesPath)) {
    const nodeTypes = JSON.parse(fs.readFileSync(nodeTypesPath, "utf8"));
    binding.nodeTypeInfo = nodeTypes;
  }
} catch (_) {}

// Named exports for compatibility  
module.exports = binding.language;
module.exports.language = binding.language;
module.exports.nodeTypes = binding.nodeTypeInfo;
module.exports.name = "tree-sitter-craft";
module.exports.default = binding.language;
