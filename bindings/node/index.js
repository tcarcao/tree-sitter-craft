import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));

const binding = typeof process.versions.bun === "string"
  // Support `bun build --compile` by being statically analyzable enough to find the .node file at build-time
  ? await import(`${root}/prebuilds/${process.platform}-${process.arch}/tree-sitter-craft.node`)
  : (await import("node-gyp-build")).default(root);

try {
  const nodeTypes = await import(`${root}/src/node-types.json`, {with: {type: "json"}});
  binding.nodeTypeInfo = nodeTypes.default;
} catch (_) {}

// Named exports for compatibility
export const language = binding;
export const nodeTypes = binding.nodeTypeInfo;
export const name = "tree-sitter-craft";

// Default export for clean imports
export default binding;