import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import { array } from '@ember/helper';

<template>
  {{pageTitle @controller.model.governingBodyClassification.label}}

  {{breadcrumb
    @controller.model.governingBodyClassification.label
    route="organizations.organization.governing-bodies.governing-body"
    models=(array
      @controller.model.organization.id @controller.model.governingBody.id
    )
  }}

  {{outlet}}
</template>
