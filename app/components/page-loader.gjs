import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';

<template>
  <div class="au-o-box" ...attributes>
    <AuLoader>
      {{~#if (has-block)~}}
        {{yield}}
      {{~else~}}
        Aan het laden
      {{~/if~}}
    </AuLoader>
  </div>
</template>
