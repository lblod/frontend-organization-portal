import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import paramsFor from 'frontend-organization-portal/helpers/params-for';

<template>
  {{pageTitle "Veranderingsgebeurtenissen"}}

  {{breadcrumb
    "Veranderingsgebeurtenissen"
    route="organizations.organization.change-events"
    model=(paramsFor "organizations.organization" param="id")
  }}

  {{outlet}}
</template>
