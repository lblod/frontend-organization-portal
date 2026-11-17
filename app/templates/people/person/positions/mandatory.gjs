import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import { array } from '@ember/helper';

<template>
  {{pageTitle @model.mandatory.mandate.roleBoard.label}}
  {{breadcrumb
    @controller.model.mandatory.mandate.roleBoard.label
    route="people.person.positions.mandatory"
    models=(array @controller.model.person.id @controller.model.mandatory.id)
  }}
  {{outlet}}
</template>
