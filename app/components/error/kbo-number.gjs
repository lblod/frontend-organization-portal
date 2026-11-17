import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';

<template>
  <AuHelpText @error={{true}}>
    {{@error.message}}
    {{#if @error.context.organization}}
      <AuLink
        @route="organizations.organization"
        @model={{@error.context.organization.id}}
        target="_blank"
      >
        {{@error.context.organization.abbName}}
      </AuLink>
    {{/if}}
  </AuHelpText>
</template>
