import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import NavigationBar from 'frontend-organization-portal/components/navigation-bar';

<template>
  {{pageTitle "Personen"}}
  {{breadcrumb "Personen" route="people"}}

  <div class="au-c-body-container au-c-body-container--scroll">
    <NavigationBar />
    {{outlet}}
  </div>
</template>
