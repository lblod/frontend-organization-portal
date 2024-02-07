import { hasMany } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import { validateHasManyOptional } from '../validators/schema';

export default class AgentModel extends AbstractValidationModel {
  @hasMany('post', {
    inverse: null,
    async: true,
  })
  positions;

  @hasMany('contact-point', {
    inverse: null,
    async: true,
  })
  contacts;

  get validationSchema() {
    return Joi.object({
      positions: validateHasManyOptional(),
      contacts: validateHasManyOptional(),
    });
  }
}
