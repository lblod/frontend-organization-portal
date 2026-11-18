import pageTitle from 'ember-page-title/helpers/page-title';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';

<template>
  {{pageTitle "Pagina niet gevonden"}}

  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-region-large">
      <div class="au-o-layout">
        <AuContent @skin="large">
          <h1>We kunnen de pagina niet vinden</h1>
          <p>Er is iets fout gelopen. De link die je bezocht, bestaat niet.</p>
        </AuContent>
      </div>
    </div>
  </div>
</template>
