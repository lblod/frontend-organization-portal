import and from 'ember-truth-helpers/helpers/and';

<template>
  {{#if (and @site.isOtherSite @site.siteTypeName)}}
    {{@site.siteType.label}}
    ({{@site.siteTypeName}})
  {{else}}
    {{@site.siteType.label}}
  {{/if}}
</template>
