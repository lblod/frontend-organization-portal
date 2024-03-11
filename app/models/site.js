import { hasMany, belongsTo, attr } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
  validateStringOptional,
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

  @attr siteTypeName;

  get validationSchema() {
    return Joi.object({
      address: validateBelongsToOptional(),
      contacts: validateHasManyOptional(),
      siteType: validateBelongsToRequired('Voeg een type vestiging toe'),
      siteTypeName: validateStringOptional(),
    });
  }

  get isOtherSite() {
    return (
      this.siteType &&
      this.siteType.get('id') === 'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
    );
  }
}
