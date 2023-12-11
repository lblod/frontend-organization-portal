import { hasMany } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import { hasManyOptional } from '../validators/schema';

export default class AgentModel extends AbstractValidationModel {
  @hasMany('post', {
    inverse: null,
  })
  positions;

  @hasMany('contact-point', {
    inverse: null,
  })
  contacts;

  get validationSchema() {
    return Joi.object({
      positions: hasManyOptional(),
      contacts: hasManyOptional(),
    });
  }
}
