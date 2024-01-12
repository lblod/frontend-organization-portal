import { attr, hasMany } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import { validateHasManyOptional } from '../validators/schema';

export default class DecisionActivityModel extends AbstractValidationModel {
  @attr('date') endDate;

  @hasMany('decision', {
    inverse: 'hasDecisionActivity',
  })
  givesCauseTo;

  get validationSchema() {
    return Joi.object({
      endDate: Joi.date().allow(null),
      givesCauseTo: validateHasManyOptional(),
    });
  }
}
