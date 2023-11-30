import { attr } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import { object } from 'yup';
export default class OrganizationClassificationCodeModel extends AbstractValidationModel {
  @attr label;

  get validationSchema() {
    return object().shape({});
  }
}
