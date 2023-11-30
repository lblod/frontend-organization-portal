import { hasMany } from '@ember-data/model';
import { object } from 'yup';
import AbstractValidationModel from './abstract-validation-model';

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
    return object().shape({});
  }
}
