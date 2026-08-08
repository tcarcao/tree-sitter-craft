#include "tree_sitter/parser.h"

// External scanner for craft's trailing operation annotation.
//
// craft's rule (opAnnotationStart in internal/syntax/parser.go) is:
//
//   The annotation opener is the LAST `[` on the line, and the line's last
//   token must be `]`.
//
// A `[` that is not the last one on the line, or whose line does not end in
// `]`, is ordinary prose. A pure tree-sitter grammar cannot express that,
// because deciding what a `[` means needs lookahead to the end of the line at
// the moment the lexer sees it. This scanner supplies exactly that lookahead
// and nothing else: it emits ANNOTATION_START only for a `[` that genuinely
// opens an annotation, and otherwise emits nothing so the `[` falls through to
// the internal lexer and is absorbed by `_prose_atom`.
//
// The scanner carries no state between calls, so serialize/deserialize are
// no-ops.

enum TokenType {
  ANNOTATION_START,
};

static inline bool is_inline_space(int32_t c) {
  return c == ' ' || c == '\t';
}

void *tree_sitter_craft_external_scanner_create(void) { return NULL; }

void tree_sitter_craft_external_scanner_destroy(void *payload) { (void)payload; }

unsigned tree_sitter_craft_external_scanner_serialize(void *payload, char *buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_craft_external_scanner_deserialize(void *payload, const char *buffer,
                                                    unsigned length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

bool tree_sitter_craft_external_scanner_scan(void *payload, TSLexer *lexer,
                                             const bool *valid_symbols) {
  (void)payload;

  if (!valid_symbols[ANNOTATION_START]) return false;

  // Leading blanks are extras the internal lexer would normally skip. The
  // external scanner runs first, so it has to skip them itself. Newlines are
  // deliberately not skipped: an annotation lives on the action's own line.
  while (is_inline_space(lexer->lookahead)) lexer->advance(lexer, true);

  if (lexer->lookahead != '[') return false;

  lexer->advance(lexer, false);
  lexer->mark_end(lexer);
  lexer->result_symbol = ANNOTATION_START;

  // Everything past this point is lookahead only. mark_end has already pinned
  // the token to the single `[`, so the advances below extend the scan window
  // without extending the token.
  bool saw_later_bracket = false;
  int32_t last_significant = 0;
  int brace_depth = 0;
  int32_t prev = '[';

  for (;;) {
    if (lexer->eof(lexer)) break;

    int32_t c = lexer->lookahead;
    if (c == '\n' || c == '\r') break;

    // A comment ends the line as far as craft's parser is concerned: peekAt
    // skips comment tokens, so `[POST /v1/x] // note` still annotates. craft's
    // lexer only opens a comment when the `/` is preceded by whitespace, which
    // is what keeps a payload like `/v1/x` or `ledger.Postings/Create` intact.
    if (c == '/' && is_inline_space(prev)) {
      lexer->advance(lexer, false);
      int32_t next = lexer->lookahead;
      if (next == '/' || next == '*') break;
      last_significant = '/';
      prev = '/';
      continue;
    }

    if (c == '}') {
      // A `}` at depth 0 closes the enclosing block, so it ends the line's
      // token run. Inside a balanced `{...}` (a templated path segment such as
      // `/v1/accounts/{id}/charges`) it is just payload.
      if (brace_depth == 0) break;
      brace_depth--;
    } else if (c == '{') {
      brace_depth++;
    } else if (c == '[') {
      saw_later_bracket = true;
    }

    if (!is_inline_space(c)) last_significant = c;
    prev = c;
    lexer->advance(lexer, false);
  }

  // Not the last `[` on the line, or the line does not end in `]`: prose.
  return !saw_later_bracket && last_significant == ']';
}
