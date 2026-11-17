import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import paramsFor from '../../../helpers/params-for';

<template>
  {{pageTitle "Posities"}}
  {{breadcrumb
    "Posities"
    route="people.person.positions"
    model=(paramsFor "people.person" param="id")
  }}
  {{outlet}}
</template>
