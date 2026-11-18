import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import paramsFor from 'frontend-organization-portal/helpers/params-for';

<template>
  {{pageTitle "Bestuursorganen"}}

  {{breadcrumb
    "Bestuursorganen"
    route="organizations.organization.governing-bodies"
    model=(paramsFor "organizations.organization" param="id")
  }}

  {{outlet}}
</template>
