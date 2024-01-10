import { hasMany } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import { validateHasManyOptional } from '../validators/schema';

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
      positions: validateHasManyOptional(),
      contacts: validateHasManyOptional(),
    });
  }
}
