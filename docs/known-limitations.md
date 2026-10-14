# Known Limitations

## Multi-line identifier lists — no trailing comma on the last item

**Affects:** `identifier_list` rule (used for `contexts:`, `data-stores:`, `to:`, `through:` properties)

Multi-line continuation is supported when items are separated by a comma at the end of each intermediate line:

```craft
services {
  AccountService {
    contexts: RegistrationApplication, AccountManagement,
        AccountSettings, AccountNote
    language: golang
  }
}
```

**Not supported:** trailing comma on the final continuation line immediately before the next property:

```craft
// This will produce a parse error in tree-sitter
services {
  AccountService {
    contexts: RegistrationApplication,
        AccountManagement,    <- trailing comma on last item
    language: golang
  }
}
```

**Why:** Adding `optional(',')` at the end of `identifier_list` creates an unresolvable shift/reduce conflict in the tree-sitter LR table. When the parser sees `identifier ','` followed by a newline, it cannot determine whether the comma is a trailing comma (reduce) or the start of a continuation (shift) without unbounded lookahead.

**Workaround:** Remove the trailing comma from the last item in a multi-line list.

**Note:** The authoritative ANTLR parser (used by the `craft-cli`) handles trailing commas correctly. This limitation only affects tree-sitter (syntax highlighting in editors).

## Words after a `notifies` event are accepted

```craft
        sync notifies the owners team
```

Since craft 2.24.0 the words after the event (`owners team`) are a syntax error. tree-sitter still accepts them as a trailing `phrase`.

**Why:** if the grammar rejects them, the ERROR node covers the whole `use_case` block, and highlighting breaks for the block while the user types. The craft language server reports the error.

The same applies to a `notifies one of` list.
