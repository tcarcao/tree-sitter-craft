// Tree-sitter grammar for Craft DSL - Hybrid of working backup + ANTLR mapping
export default grammar({
  name: 'craft',

  extras: $ => [
    /[ \t]/,
    $._newline,
    $.doc_comment,
    $.comment,
  ],

  rules: {
    // Use working backup structure for source_file
    source_file: $ => seq(
      repeat($._newline),
      repeat($._top_level_item),
    ),

    // Map ANTLR top level items to working backup names
    _top_level_item: $ => choice(
      $.import_decl,     // import statement
      $.arch_block,      // maps to ANTLR 'arch'
      $.services_block,  // maps to ANTLR 'services_def'
      $.service_block,   // maps to ANTLR 'service_def'
      $.domain_block,    // maps to ANTLR 'domain_def'
      $.domains_block,   // maps to ANTLR 'domains_def'
      $.actors_block,    // maps to ANTLR 'actors_def'
      $.actor_block,     // maps to ANTLR 'actor_def'
      $.exposure_block,  // maps to ANTLR 'exposure'
      $.use_case_block,  // maps to ANTLR 'use_case'
      $.context_map_block, // context_map { edge_stmt* }
      $.glossary_block,   // glossary { glossary_stmt* }
    ),

    // context_map block: relationships between bounded contexts / services /
    // ubiquitous-language terms, expressed as `<ref> <edge_verb> <ref>` lines.
    // Follows the same NEWLINE framing the other brace blocks use. The block
    // may optionally carry a domain-scope identifier right after the
    // `context_map` keyword (e.g. `context_map re { ... }`), which lets
    // endpoints inside the block be written bare (relative to that domain)
    // instead of qualified with `domain/name`.
    context_map_block: $ => seq(
      'context_map',
      optional($.context_map_scope),
      '{',
      repeat1($._newline),
      repeat(seq($.edge_stmt, repeat1($._newline))),
      '}',
      repeat($._newline),
    ),

    context_map_scope: $ => $.identifier,

    edge_stmt: $ => seq($.ref, $.edge_verb, $.ref),

    // The 8 DDD relationship verbs (Eric Evans' context-mapping patterns),
    // per craft's edgeKeywords. Replaces the old 5 ad-hoc verbs
    // (realized_by/also_realizes/same_as/contrasts/distinct_from) — this is
    // a clean replacement, not a union; old syntax is no longer accepted.
    edge_verb: $ => choice(
      'customer_supplier',
      'conformist',
      'anticorruption_layer',
      'open_host_service',
      'published_language',
      'partnership',
      'shared_kernel',
      'separate_ways',
    ),

    // glossary block: ubiquitous-language term relationships, expressed as
    // `<ref> <glossary_verb> <ref>` lines. Mirrors context_map_block exactly
    // (same NEWLINE framing, same optional domain-scope identifier right
    // after the `glossary` keyword). Term nodes reuse the existing
    // slug/ref rules — no new ref rule needed since slug already accepts
    // multi-segment `a/b/c` paths (verified by parsing `billing/Invoice`
    // and `re/billing/Invoice` below).
    glossary_block: $ => seq(
      'glossary',
      optional($.glossary_scope),
      '{',
      repeat1($._newline),
      repeat(seq($.glossary_stmt, repeat1($._newline))),
      '}',
      repeat($._newline),
    ),

    glossary_scope: $ => $.identifier,

    glossary_stmt: $ => seq($.ref, $.glossary_verb, $.ref),

    // The 3 ubiquitous-language relationship verbs.
    glossary_verb: $ => choice(
      'same_as',
      'contrasts',
      'distinct_from',
    ),

    // Typed reference. Bare form is a slug (dotted single segment like
    // `vas.VasApplied`, or a slash path like `re/subscriptions`); typed form is
    // `<kind>:<slug>` (e.g. `bc:re/subscriptions`, `service:subscriptions-api`).
    ref: $ => choice(
      $.slug,
      seq($.ref_kind, ':', $.slug),
    ),

    // bc/term arrive via identifier; service/domain are keyword tokens (no
    // `word:` directive) so they must be listed explicitly.
    ref_kind: $ => choice($.identifier, 'service', 'domain'),

    // Import statement
    import_decl: $ => seq(
      'import',
      $.string,
    ),

    // Architecture - use working backup structure with ANTLR precision
    arch_block: $ => seq(
      'arch',
      optional($.identifier), // ANTLR: arch_name?
      '{',
      repeat1($._newline),
      $.arch_section,
      '}',
      repeat($._newline),
    ),

    arch_section: $ => choice(
      $.presentation_section,
      $.gateway_section,
    ),

    arch_continuation: $ => choice(
      seq(repeat1($._newline), $.arch_section),
      seq(repeat1($._newline), $.arch_component_list),
      repeat1($._newline),
    ),

    // ANTLR: presentation_section: 'presentation' ':' NEWLINE* arch_component_list NEWLINE+;
    // Let arch_component_list handle its own trailing newlines
    presentation_section: $ => seq(
      'presentation',
      ':',
      repeat($._newline),
      $.arch_component_list,
    ),

    // ANTLR: gateway_section: 'gateway' ':' NEWLINE* arch_component_list NEWLINE+;
    // Let arch_component_list handle its own trailing newlines
    gateway_section: $ => seq(
      'gateway',
      ':',
      repeat($._newline),
      $.arch_component_list,
    ),

    // ANTLR: arch_component_list: arch_component (NEWLINE+ arch_component)*;
    // Use right precedence to prevent over-consuming
    arch_component_list: $ => prec.left(seq(
      $.arch_component,
      optional($.arch_continuation),
    )),

    // ANTLR: arch_component: simple_component | component_flow;
    arch_component: $ => choice(
      $.simple_component,
      $.component_flow,
    ),

    // ANTLR: component_flow: component_chain; component_chain: component_with_modifiers ('>' component_with_modifiers)*;
    component_flow: $ => seq(
      $.component_with_modifiers,
      repeat1(seq('>', $.component_with_modifiers)),
    ),

    // ANTLR: component_with_modifiers: component_name component_modifiers?;
    // Hybrid approach: use specific node type for component names
    component_with_modifiers: $ => seq(
      $.component_name,  // specific node type for direct parent detection
      optional($.component_modifiers),
    ),

    // Specific node type for arch component names (hybrid approach)
    component_name: $ => $.identifier,

    // ANTLR: component_modifiers: '[' modifier_list ']';
    component_modifiers: $ => seq(
      '[',
      $.modifier_list,
      ']',
    ),

    // ANTLR: modifier_list: modifier (',' modifier)*;
    // Use backup's working sep1 function
    modifier_list: $ => sep1($.modifier, ','),

    // ANTLR: modifier: IDENTIFIER (':' IDENTIFIER)?;
    // Hybrid approach: use specific node types for modifier keys and values
    modifier: $ => seq(
      $.modifier_key,
      optional(seq(':', $.modifier_value)),
    ),

    // Specific node types for modifiers (hybrid approach)
    modifier_key: $ => $.identifier,
    // Q7: modifier_value now accepts strings in addition to identifiers/numbers/booleans
    modifier_value: $ => choice($.identifier, $.number, $.boolean, $.string),

    // ANTLR: simple_component: component_with_modifiers;
    simple_component: $ => $.component_with_modifiers,

    // Services - use working backup structure with ANTLR names mapped
    // ANTLR: services_def: 'services' '{' NEWLINE* service_block_list? '}' NEWLINE*;
    services_block: $ => seq(
      'services',
      '{',
      repeat($._newline),
      repeat(seq($.service_definition, optional($._newline))), // service_definition = service_block in ANTLR
      '}',
      repeat($._newline),
    ),

    // ANTLR: service_def: 'service' service_name '{' NEWLINE* service_properties '}' NEWLINE*;
    service_block: $ => seq(
      'service',
      $.identifier,
      '{',
      optional($._newline),
      repeat(seq($.service_property, optional($._newline))),
      '}',
      repeat($._newline),
    ),

    // ANTLR service_block mapped to service_definition
    service_definition: $ => seq(
      choice($.string, $.identifier), // service_name can be IDENTIFIER | STRING
      '{',
      repeat($._newline),
      repeat(seq($.service_property, optional($._newline))),
      '}',
    ),

    // ANTLR: service_property with correct property names
    service_property: $ => choice(
      $.service_contexts_property,
      $.language_property,
      $.data_stores_property,
      $.deployment_property,
      $.catalog_ref_property,
      $.repo_property,
    ),

    catalog_ref_property: $ => seq('catalog_ref', ':', $.identifier),

    // ref covers the slash path form, e.g. olxeu/realestate/subscriptions
    repo_property: $ => seq('repo', ':', $.ref),

    service_contexts_property: $ => seq(
      'contexts',
      ':',
      $.identifier_list,
    ),

    language_property: $ => seq(
      'language',
      ':',
      $.identifier,
    ),

    data_stores_property: $ => seq(
      'data-stores',
      ':',
      $.identifier_list,
    ),

    deployment_property: $ => seq(
      'deployment',
      ':',
      $.deployment_spec,
    ),

    deployment_spec: $ => choice(
      $.deployment_type,
      seq($.deployment_type, $.deployment_rules),
    ),

    // Q6: deployment_type is now open (any identifier)
    deployment_type: $ => $.identifier,

    deployment_rules: $ => seq(
      '(',
      sep1($.deployment_rule, ','),
      ')',
    ),

    deployment_rule: $ => seq(
      $.percentage,
      '->',
      $.identifier,
    ),

    // Domain definitions - ANTLR mapping
    // ANTLR: domain_def: 'domain' domain_name '{' NEWLINE* bounded_context_list '}' NEWLINE*;
    domain_block: $ => seq(
      'domain',
      $.identifier, // domain_name = IDENTIFIER
      '{',
      optional($._newline),
      repeat(seq($.bounded_context, optional($._newline))),
      '}',
      repeat($._newline),
    ),

    // ANTLR: domains_def: 'domains' '{' NEWLINE* domain_block_list '}' NEWLINE*;
    domains_block: $ => seq(
      'domains',
      '{',
      optional($._newline),
      repeat(seq($.domain_definition, optional($._newline))),
      '}',
      repeat($._newline),
    ),

    domain_definition: $ => seq(
      $.identifier,
      '{',
      optional($._newline),
      repeat(seq($.bounded_context, optional($._newline))),
      '}',
    ),

    bounded_context: $ => $.identifier,

    // Actors definitions - following same pattern as domains/services
    // ANTLR: actor_def: 'actor' actor_type actor_name NEWLINE*;
    actor_block: $ => seq(
      'actor',
      $.actor_type,
      $.actor_name,
      repeat($._newline),
    ),

    // ANTLR: actors_def: 'actors' '{' NEWLINE* actor_definition_list '}' NEWLINE*;  
    actors_block: $ => seq(
      'actors',
      '{',
      optional($._newline),
      repeat(seq($.actor_definition, optional($._newline))),
      '}',
      repeat($._newline),
    ),

    // ANTLR: actor_definition: actor_type actor_name;
    actor_definition: $ => seq(
      $.actor_type,
      $.actor_name,
    ),

    // Q5: actor_type is now open (any identifier)
    actor_type: $ => $.identifier,

    // ANTLR: actor_name: IDENTIFIER;
    actor_name: $ => $.identifier,

    // Exposure blocks - ANTLR mapping
    exposure_block: $ => seq(
      'exposure',
      $.identifier,
      '{',
      optional($._newline),
      repeat(seq($.exposure_property, optional($._newline))),
      '}',
      repeat($._newline),
    ),

    exposure_property: $ => choice(
      $.to_property,
      $.through_property,
      $.exposure_contexts_property,
    ),

    to_property: $ => seq(
      'to',
      ':',
      $.identifier_list,
    ),

    through_property: $ => seq(
      'through',
      ':',
      $.identifier_list,
    ),

    exposure_contexts_property: $ => seq(
      'contexts',
      ':',
      $.identifier_list,
    ),

    use_case_block: $ => seq(
      'use_case',
      $.string,
      '{',
      repeat1($._newline),
      optional(seq($.tags_block, repeat1($._newline))),
      $.scenario,
      '}',
      repeat($._newline),
    ),

    // Q11 (Task 6 / Slice D): `tags { }` sub-block on use_case, mirroring the
    // Go parser's `IDENT ':' (IDENT | STRING | ref-shaped-slug)` tag lines
    // (see craft repo internal/syntax/parser.go parseTagStmt). `tags` is kept
    // a bare string literal in the seq — a contextual keyword, same as
    // `when`/`use_case` elsewhere in this grammar — not a reserved word.
    tags_block: $ => seq(
      'tags',
      '{',
      optional($._newline),
      repeat(seq($.tag_stmt, optional($._newline))),
      '}',
    ),

    tag_stmt: $ => seq(
      field('key', $.identifier),
      ':',
      field('value', choice($.string, $.slug)),
    ),

    // Bare tag value: one or more identifier-shaped segments joined by '/',
    // e.g. `gold` (single segment) or `re/renewal-flow` (slug). Mirrors the
    // shape the Go parser's parseRef captures for bare ref/slug values
    // (ident ('/' ident)*) — there is no existing tree-sitter rule for this
    // shape yet (context_map/refs are not mirrored into this grammar as of
    // this baseline), so this is the first tree-sitter rule for it.
    //
    // Kept as a visible node (not hidden with a leading `_`) rather than the
    // task brief's literal `_slug_value` suggestion: a hidden rule here would
    // make `field('value', ...)` attach separately to *each* identifier
    // segment of a multi-segment slug (two `value:` children for one tag
    // line), which is confusing for consumers. Wrapping every bare value —
    // single segment or slug — in one `slug` node gives a uniform, single
    // `value:` child regardless of segment count.
    slug: $ => seq(
      $.identifier,
      repeat(seq('/', $.identifier)),
    ),

    scenario_continuation: $ => choice(
      seq(repeat1($._newline), $.scenario),
      seq(repeat1($._newline), $.action),
      repeat1($._newline),
    ),

    scenario: $ => seq(
      $.when_clause,
      optional($.scenario_continuation),
    ),

    when_clause: $ => seq(
      'when',
      choice(
        seq($.external_trigger, $._newline),
        seq($.event_trigger, $._newline),
        seq($.domain_listener, $._newline),
        seq($.cron_trigger, $._newline),
      ),
      repeat(seq($.action, $._newline)),
    ),

    // Hybrid approach: use specific node types for external triggers
    external_trigger: $ => prec.left(2, choice(
      seq(
        $.trigger_actor, // Actor
        $.trigger_verb, // Verb
        $.connector_word,
        $.phrase, // Phrase
      ),
      seq(
        $.trigger_actor, // Actor
        $.trigger_verb, // Verb
        $.phrase, // Phrase
      ),
      seq(
        $.trigger_actor, // Actor
        $.trigger_verb, // Verb
      )
    )),

    // Specific node types for triggers (hybrid approach)
    trigger_actor: $ => $.identifier,   // Actor name in triggers
    trigger_verb: $ => $.identifier,    // Verb in triggers

    event_trigger: $ => $.string,

    domain_listener: $ => seq(
      $.identifier, // Domain
      'listens',
      choice($.string, $.ref), // Event: quoted string or bare/typed ref
    ),

    cron_trigger: $ => choice(
      seq('cron', $.string),   // when cron "0 * * * *"
      seq('every', $.string),  // when every "1h"
    ),

    action: $ => choice(
      $.sync_action,
      $.async_action,
      $.internal_action,
      $.return_action,
    ),

    // Hybrid approach: use specific node types for action contexts
    sync_action: $ => prec.left(2, choice(
      seq(
        $.action_subject, // Source domain  
        'asks',
        $.action_target, // Target domain
        $.connector_word,
        $.phrase,
      ),
      seq(
        $.action_subject, // Source domain
        'asks', 
        $.action_target, // Target domain
        $.phrase,
      ),
    )),

    async_action: $ => seq(
      $.action_subject, // Domain
      'notifies',
      choice($.string, $.ref), // Event: quoted string or bare/typed ref
    ),

    // Hybrid approach: use specific node types for internal actions
    internal_action: $ => prec.left(1, seq(
      $.action_subject, // Domain/Service
      $.action_verb, // Verb
      optional($.connector_word),
      $.phrase,
    )),

    // Return action: domain returns [to domain] [connector_word] phrase
    return_action: $ => prec.left(2, choice(
      seq(
        $.action_subject, // Source domain
        'returns',
        'to',
        $.action_target, // Target domain
        optional($.connector_word),
        $.phrase,
      ),
      seq(
        $.action_subject, // Source domain
        'returns',
        optional($.connector_word),
        $.phrase,
      ),
    )),

    // Specific node types for actions (hybrid approach)
    action_subject: $ => $.identifier,  // Service or domain name in actions
    action_target: $ => $.ref,          // Target: bare name (Database) or typed ref (bc:re/billing)
    action_verb: $ => $.identifier,     // Verb in actions

    connector_word: $ => choice(
      'a', 'an', 'the', 'as', 'to', 'from', 'in', 'on', 'at', 'for', 'with', 'by', 'of'
    ),

    // Use backup's working phrase with precedence. Accepts free-form same-line
    // prose: identifiers, strings, connector words, numbers, and any other
    // non-whitespace/brace/quote chunk (punctuation like `(1! & 2!)`) via the
    // low-precedence prose atom. Still bounded at newline (newline is not
    // matched by _prose_atom).
    phrase: $ => prec.left(1, repeat1(choice(
      $.identifier,
      $.string,
      $.connector_word,
      $.number,
      $._prose_atom,
    ))),

    // Any run of non-whitespace that is not a brace or quote. prec(-1) so it
    // never shadows identifiers/keywords/numbers of equal length elsewhere.
    _prose_atom: $ => token(prec(-1, /[^\s{}"]+/)),

    // Common elements - from backup
    // Allows continuation lines: items may be separated by comma + optional newlines.
    // Trailing commas are NOT supported in tree-sitter (syntax highlighting only);
    // the authoritative ANTLR parser handles them.
    identifier_list: $ => seq(
      $.identifier,
      repeat(seq(',', repeat($._newline), $.identifier)),
    ),

    // Q9: identifiers now allow dots (e.g. my.service)
    identifier: $ => /[a-zA-Z0-9_][a-zA-Z0-9_.-]*/,

    string: $ => seq(
      '"',
      repeat(choice(
        /[^"\\]/,
        /\\./,
      )),
      '"',
    ),

    number: $ => /\d+/,

    percentage: $ => /\d+%/,

    boolean: $ => choice('true', 'false'),

    doc_comment: $ => /\/\/\/[^\n]*/,

    comment: $ => choice(
      /\/\/[^\n]*/,
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    ),

    _newline: $ => /\r?\n/,
  }
});

// Helper function for comma-separated lists
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)), optional(separator));
}