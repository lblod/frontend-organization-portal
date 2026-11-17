import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import paramsFor from '../../../helpers/params-for';

<template>
  {{pageTitle "Gerelateerde organisaties"}}

  {{breadcrumb
    "Gerelateerde organisaties"
    route="organizations.organization.related-organizations"
    model=(paramsFor "organizations.organization" param="id")
  }}

  {{outlet}}
</template>
