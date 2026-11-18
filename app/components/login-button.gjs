import AuLink from '@appuniversum/ember-appuniversum/components/au-link';

<template>
  <AuLink
    @route="auth.login"
    {{! TODO: it might be nice if this would link to the mock-login route based on some environment variable}}
    @skin={{if @isCompact "primary" "button"}}
    @icon="login"
  >
    Meld je aan
  </AuLink>
</template>
