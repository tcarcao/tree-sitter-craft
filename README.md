# Tree-sitter Craft

[![npm](https://img.shields.io/npm/v/tree-sitter-craft.svg)](https://www.npmjs.com/package/tree-sitter-craft)
[![npm](https://img.shields.io/npm/dt/tree-sitter-craft.svg)](https://www.npmjs.com/package/tree-sitter-craft)

Tree-sitter grammar for **Craft DSL** - A domain-specific language for modeling business use cases and domain interactions with powerful visualization capabilities for domain-driven design and C4 architecture diagrams.

## Features

- 🔥 **High-performance parsing** with Tree-sitter's incremental parsing
- 🎯 **Syntax highlighting** with semantic tokens and queries
- 📝 **Rich language support** for VSCode and other editors
- 🌐 **WebAssembly support** for browser-based editors
- 🧪 **Well-tested grammar** with comprehensive test suite

## Installation

### npm

```bash
npm install tree-sitter-craft
```

### Using in Node.js

```javascript
import Parser from 'tree-sitter';
import Craft from 'tree-sitter-craft';

const parser = new Parser();
parser.setLanguage(Craft);

const sourceCode = `
services {
  UserService {
    domains: Authentication, Profile
    language: typescript
  }
}

use_case "User Registration" {
  when Business_User creates Account
    Authentication validates email format
    Authentication asks Database to check email uniqueness
    Profile creates user profile
}
`;

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

### Using in Web Browsers

```html
<script src="https://unpkg.com/web-tree-sitter@^0.25.0/tree-sitter.js"></script>
<script>
(async () => {
  await TreeSitter.init();
  const parser = new TreeSitter();
  const Lang = await TreeSitter.Language.load('tree-sitter-craft.wasm');
  parser.setLanguage(Lang);
  
  const tree = parser.parse('use_case "Example" { when user does something }');
  console.log(tree.rootNode.toString());
})();
</script>
```

## Language Overview

Craft DSL enables you to model:

- **Services**: Deployable units with technology specifications
- **Use Cases**: Business scenarios through triggers and actions  
- **Domains**: Core business domains and their interactions
- **Architecture**: Component flows and system design
- **Exposures**: External access points and relationships

### Example Syntax

```craft
// Service definition
services {
  EcommerceAPI {
    domains: Order, Payment, Inventory
    language: nodejs
    data-stores: postgres, redis
  }
}

// Use case modeling
use_case "Order Processing" {
  when Customer creates Order
    Order validates product availability
    Order asks Inventory to reserve items
    Order creates payment request
    Order notifies "OrderCreated"
    
  when Payment listens "OrderCreated"
    Payment processes payment
    Payment returns confirmation
}

// Architecture definition
arch OrderFlow {
  presentation:
    WebApp > LoadBalancer
    
  gateway:
    LoadBalancer > API[framework: express, ssl: true]
    API > Database[type: postgres]
}
```

## Development

### Prerequisites

- Node.js 16+
- Tree-sitter CLI: `npm install -g tree-sitter-cli`

### Building

```bash
# Generate parser from grammar
npm run generate

# Build native bindings
npm run build

# Build WebAssembly module
npm run build-wasm

# Run tests
npm test
```

### Grammar Development

The grammar is defined in `grammar.js`. After making changes:

1. Regenerate the parser: `npm run generate`
2. Update tests in `test/corpus/`
3. Run tests: `npm test`
4. Build WASM: `npm run build-wasm`

## Syntax Highlighting

This package includes syntax highlighting queries for Tree-sitter compatible editors:

- **highlights.scm**: Semantic highlighting rules
- Supports 40+ distinct token types for precise syntax coloring
- Context-aware highlighting based on grammar structure

### Usage with Editors

The highlighting queries are automatically available when the package is installed. Editors that support Tree-sitter will use the `queries/highlights.scm` file.

## API Reference

### Parser Methods

```javascript
// Basic parsing
const tree = parser.parse(sourceCode);

// Incremental parsing (re-parse only changed parts)
const newTree = parser.parse(newSourceCode, tree);

// Get syntax tree as S-expression
console.log(tree.rootNode.toString());
```

### Query System

```javascript
import { Query } from 'tree-sitter';

// Load highlighting query
const highlightQuery = new Query(Craft, highlightQuerySource);

// Execute query
const captures = highlightQuery.captures(tree.rootNode);
captures.forEach(({ name, node }) => {
  console.log(`${name}: ${node.text}`);
});
```

## Testing the Grammar

The grammar includes comprehensive tests covering:

- ✅ Service definitions and properties
- ✅ Use case modeling and flows
- ✅ Domain interactions and events
- ✅ Architecture specifications
- ✅ Error recovery and edge cases

### Running Tests

```bash
# Run all grammar tests
npm test

# Parse a specific file
npx tree-sitter parse <file.craft>

# Test with query files
npx tree-sitter query <query-file> <file.craft> 
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes to `grammar.js`
4. Add tests in `test/corpus/`
5. Run tests: `npm test`
6. Submit a pull request

## License

MIT © [Tiago Carcao](https://github.com/tcarcao)

## Related Projects

- [Craft Language](https://github.com/tcarcao/craft) - The main Craft DSL implementation
- [VSCode Craft Extension](https://github.com/tcarcao/craft/tree/main/tools/vscode-extension) - VSCode language support

---

*Tree-sitter Craft provides the parsing foundation for rich Craft DSL tooling and editor support.*