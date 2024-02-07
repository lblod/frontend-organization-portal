import { hasMany, belongsTo, attr } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
} from '../validators/schema';

export default class SiteModel extends AbstractValidationModel {
  @attr siteTypeName;

  @belongsTo('address', {
    inverse: null,
    async: true,
  })
  address;

  @hasMany('contact-point', {
    inverse: null,
    async: true,
  })
  contacts;

  @belongsTo('site-type', {
    inverse: null,
    async: true,
  })
  siteType;

  get validationSchema() {
    return Joi.object({
      address: validateBelongsToOptional(),
      contacts: validateHasManyOptional(),
      siteType: validateBelongsToRequired('Voeg een type vestiging toe'),
      siteTypeName: Joi.string().empty(''),
    });
  }

  get isOtherSite() {
    return (
      this.siteType &&
      this.siteType.get('id') === 'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
    );
  }
}
