{{#let
  (concat
    @model.changeEvent.type.label " " (date-format @model.changeEvent.date)
  )
  as |title|
}}
  {{page-title title}}
  {{breadcrumb
    title
    route="organizations.organization.change-events.details"
    models=(array @model.organization.id @model.changeEvent.id)
  }}
{{/let}}

{{outlet}}