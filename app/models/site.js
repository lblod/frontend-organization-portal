import { hasMany, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
} from '../validators/schema';

export default class SiteModel extends AbstractValidationModel {
  @belongsTo('address', {
    inverse: null,
  })
  address;

  @hasMany('contact-point', {
    inverse: null,
  })
  contacts;

  @belongsTo('site-type', {
    inverse: null,
  })
  siteType;

  get validationSchema() {
    return Joi.object({
      address: validateBelongsToOptional(),
      contacts: validateHasManyOptional(),
      siteType: validateBelongsToRequired('Voeg een type vestiging toe'),
    });
  }
}
