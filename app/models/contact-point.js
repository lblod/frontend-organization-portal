import { attr, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateEmail,
  validatePhone,
  validateUrl,
} from '../validators/schema';

export const CONTACT_TYPE = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
};

export default class ContactPointModel extends AbstractValidationModel {
  @attr email;
  @attr telephone;
  @attr fax;
  @attr website;
  @attr type;

  @belongsTo('address', {
    inverse: null,
    async: true,
  })
  contactAddress;

  get validationSchema() {
    return Joi.object({
      email: validateEmail('Geef een geldig e-mailadres in'),
      telephone: validatePhone(
        'Enkel een plusteken en cijfers zijn toegelaten'
      ),
      fax: validatePhone('Enkel een plusteken en cijfers zijn toegelaten'),
      website: validateUrl('Geef een geldig internetadres in'),
      type: Joi.string().empty(''),
      contactAddress: validateBelongsToOptional(),
    });
  }
}

export function createPrimaryContact(store) {
  let record = store.createRecord('contact-point');
  record.type = CONTACT_TYPE.PRIMARY; // Workaround for: https://github.com/emberjs/ember-inspector/issues/1898

  return record;
}

export function createSecondaryContact(store) {
  let record = store.createRecord('contact-point');
  record.type = CONTACT_TYPE.SECONDARY; // Workaround for: https://github.com/emberjs/ember-inspector/issues/1898

  return record;
}

export function findPrimaryContact(contactList) {
  return contactList.find(({ type }) => type === CONTACT_TYPE.PRIMARY);
}

export function findSecondaryContact(contactList) {
  return contactList.find(({ type }) => type === CONTACT_TYPE.SECONDARY);
}
