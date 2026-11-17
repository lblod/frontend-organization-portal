import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import { array } from '@ember/helper';

<template>
  {{pageTitle @model.site.address.fullAddress}}

  {{breadcrumb
    @controller.model.site.address.fullAddress
    route="organizations.organization.sites"
    models=(array @controller.model.organization.id @controller.model.site.id)
  }}

  {{outlet}}
</template>
