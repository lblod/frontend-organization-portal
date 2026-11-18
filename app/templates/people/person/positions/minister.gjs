import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import { array } from '@ember/helper';

<template>
  {{pageTitle @model.minister.ministerPosition.function.label}}
  {{breadcrumb
    @controller.model.minister.ministerPosition.function.label
    route="people.person.positions.minister"
    models=(array @controller.model.person.id @controller.model.minister.id)
  }}
  {{outlet}}
</template>
