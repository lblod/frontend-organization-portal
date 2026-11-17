import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import NavigationBar from '../components/navigation-bar';

<template>
  {{pageTitle "Organisaties"}}
  {{breadcrumb "Organisaties" route="organizations"}}

  <div class="au-c-body-container au-c-body-container--scroll">
    <NavigationBar />
    {{outlet}}
  </div>
</template>
