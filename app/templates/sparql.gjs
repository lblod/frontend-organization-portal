import pageTitle from 'ember-page-title/helpers/page-title';
import StaticPage from '../components/static-page';
import yasgui from '../modifiers/yasgui';

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
