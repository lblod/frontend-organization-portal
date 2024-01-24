import { attr, hasMany } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';

export default class DecisionActivityModel extends AbstractValidationModel {
  @attr('date') endDate;

  @hasMany('decision', {
    inverse: 'hasDecisionActivity',
  })
  givesCauseTo;
}
