import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import paramsFor from 'frontend-organization-portal/helpers/params-for';

<template>
  {{pageTitle "Betrokken lokale besturen"}}

  {{breadcrumb
    "Betrokken lokale besturen"
    route="organizations.organization.local-involvements"
    model=(paramsFor "organizations.organization" param="id")
  }}

  {{outlet}}
</template>
