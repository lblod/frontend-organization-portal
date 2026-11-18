import pageTitle from 'ember-page-title/helpers/page-title';
import StaticPage from 'frontend-organization-portal/components/static-page';
import yasgui from 'frontend-organization-portal/modifiers/yasgui';

<template>
  {{pageTitle "SPARQL"}}

  <StaticPage>
    <div class="au-o-region-large">
      <div class="au-o-layout">
        <div {{yasgui}}></div>
      </div>
    </div>
  </StaticPage>
</template>
