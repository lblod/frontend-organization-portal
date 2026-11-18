import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import { array } from '@ember/helper';

<template>
  {{pageTitle @model.functionary.boardPosition.roleBoard.label}}
  {{breadcrumb
    @controller.model.functionary.boardPosition.roleBoard.label
    route="people.person.positions.functionary"
    models=(array @controller.model.person.id @controller.model.mandatory.id)
  }}
  {{outlet}}
</template>
