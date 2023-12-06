import { attr, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import { object, string } from 'yup';

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
  })
  contactAddress;

  get validationSchema() {
    return object().shape({
      email: string().email('Geef een geldig e-mailadres in'),
      telephone: string().phone(),
      website: string().url(),
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
  return contactList.findBy('type', CONTACT_TYPE.PRIMARY);
}

export function findSecondaryContact(contactList) {
  return contactList.findBy('type', CONTACT_TYPE.SECONDARY);
}
