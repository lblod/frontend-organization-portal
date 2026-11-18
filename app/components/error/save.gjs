import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';

<template>
  {{#if @showSaveError}}
    <AuHelpText @error={{true}}>Je kan deze pagina niet opslaan omdat een
      verplicht veld niet is ingevuld.</AuHelpText>
  {{/if}}
</template>
