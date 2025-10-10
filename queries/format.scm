; Formatting queries for Craft DSL
; These queries identify structural patterns for formatting rules

(actor_block) @block.actor
(actor_type) @content.actor-type

; === BLOCK OPENERS ===
; Identify block opening patterns
(services_block "{" @brace.open) @block.services
(service_definition "{" @brace.open) @block.service
(service_block "{" @brace.open) @block.service
(arch_block "{" @brace.open) @block.arch
(use_case_block "{" @brace.open) @block.usecase
(domain_block "{" @brace.open) @block.domain
(domains_block "{" @brace.open) @block.domains
(domain_definition "{" @brace.open) @block.domain-def
(exposure_block "{" @brace.open) @block.exposure
(actors_block "{" @brace.open) @block.actors

; === BLOCK CLOSERS ===
(services_block "}" @brace.close)
(service_definition "}" @brace.close)
(service_block "}" @brace.close)
(arch_block "}" @brace.close)
(use_case_block "}" @brace.close)
(domain_block "}" @brace.close)
(domains_block "}" @brace.close)
(domain_definition "}" @brace.close)
(exposure_block "}" @brace.close)
(actors_block "}" @brace.close)

; === ARCH SECTIONS ===
; Arch sections
(presentation_section) @arch.section
(gateway_section) @arch.section

; === SECTION KEYWORDS ===
"presentation" @arch.presentation-section
"gateway" @arch.gateway-section

; === SCENARIOS AND WHEN CLAUSES ===
; Scenarios and when clauses
(when_clause) @content.when-clause

; Triggers
(external_trigger) @content.trigger
(event_trigger) @content.trigger
(domain_listener) @content.trigger
(cron_trigger) @content.trigger

; === PROPERTIES AND CONTENT ===
; Service properties
(service_property) @content.service-property
(domains_property) @content.domains-property
(language_property) @content.language-property
(data_stores_property) @content.data-stores-property
(deployment_property) @content.deployment-property
(deployment_type) @content.deployment-type
(deployment_rules) @content.deployment-rules
(deployment_rule) @content.deployment-rule

; Actor definitions
(actors_block
  (actor_definition) @content.actor-def
)

; Domain definitions
(domains_block
  (domain_definition) @content.domain-def
)

; Subdomains
(domain_block
  (subdomain) @content.subdomain
)

(domain_definition
  (subdomain) @content.subdomain
)

; Exposure properties
(exposure_block
  (exposure_property) @content.exposure-property
)
(to_property) @content.exposure-to-property
(through_property) @content.exposure-through-property
(of_property) @content.exposure-of-property

; Arch components
(arch_component_list) @content.component-list
(arch_component) @content.component
(simple_component) @content.simple-component
(component_flow) @content.component-flow
(component_with_modifiers) @content.component-with-modifiers
(component_name) @content.component-name
(modifier_list) @content.component-modifiers
(modifier) @content.modifier
(modifier_key) @content.modifier-key
(modifier_value) @content.modifier-value

; === ACTIONS IN WHEN CLAUSES ===
(action) @content.action
(sync_action) @content.sync-action
(async_action) @content.async-action
(internal_action) @content.internal-action
(return_action) @content.return-action

; Action components
(action_subject) @content.action-subject
(action_target) @content.action-target
(action_verb) @content.action-verb

; Trigger components
(trigger_actor) @content.trigger-actor
(trigger_verb) @content.trigger-verb

; === COMMON ELEMENTS ===
(connector_word) @content.connector-word
(identifier_list) @content.identifier-list
(identifier) @identifier
(string) @string
(number) @number
(percentage) @number.percentage
(boolean) @boolean
(phrase) @content.phrase

; Keywords
"asks" @keyword.asks
"notifies" @keyword.notifies
"returns" @keyword.returns
"listens" @keyword.listens

; === COMMENTS ===
(comment) @comment
