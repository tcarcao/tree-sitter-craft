type BaseNode = {
  type: string;
  named: boolean;
};

type ChildNode = {
  multiple: boolean;
  required: boolean;
  types: BaseNode[];
};

type NodeInfo =
  | (BaseNode & {
      subtypes: BaseNode[];
    })
  | (BaseNode & {
      fields: { [name: string]: ChildNode };
      children: ChildNode[];
    });

// Tree-sitter language interface
interface Language {
  readonly version: number;
  readonly fieldCount: number;
  readonly stateCount: number;
  readonly fields: readonly string[];
  readonly nodeTypeInfo?: NodeInfo[];
}

declare const nodeTypes: NodeInfo[];
declare const language: Language;
declare const name: string;

// Named exports
export { nodeTypes, language, name };

// Default export (the language binding)
declare const binding: Language;
export default binding;