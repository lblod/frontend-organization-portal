import { concat, array } from '@ember/helper';
import dateFormat from 'frontend-organization-portal/helpers/date-format';
import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';

<template>
  {{#let
    (concat
      @model.changeEvent.type.label " " (dateFormat @model.changeEvent.date)
    )
    as |title|
  }}
    {{pageTitle title}}
    {{breadcrumb
      title
      route="organizations.organization.change-events.details"
      models=(array @model.organization.id @model.changeEvent.id)
    }}
  {{/let}}

  {{outlet}}
</template>
