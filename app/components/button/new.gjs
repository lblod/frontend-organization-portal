import AuLink from '@appuniversum/ember-appuniversum/components/au-link';

<template>
  <AuLink
    @route={{@route}}
    @icon="add"
    @iconAlignment="left"
    @skin="button"
    ...attributes
  >
    Nieuw
  </AuLink>
</template>
