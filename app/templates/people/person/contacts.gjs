import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import paramsFor from '../../../helpers/params-for';

<template>
  {{pageTitle "Contactgegevens"}}
  {{breadcrumb
    "Contactgegevens"
    route="people.person.contacts"
    model=(paramsFor "people.person" param="id")
  }}
  {{outlet}}
</template>
