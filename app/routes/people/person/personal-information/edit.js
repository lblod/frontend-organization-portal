import Route from '@ember/routing/route';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import personValidations from 'frontend-contact-hub/validations/person';
import { inject as service } from '@ember/service';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-contact-hub/models/contact-point';
export default class PeoplePersonPersonalInformationEditRoute extends Route {
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  async model() {
    let { person, positions } = this.modelFor(
      'people.person.personal-information'
    );
    const contacts = [];
    for (let position of positions) {
      let { primaryContact, secondaryContact, _position } = position;
      if (!primaryContact) {
        primaryContact = createPrimaryContact(this.store);
        primaryContact.contactAddress = this.store.createRecord('address');
        _position.contacts.pushObject(primaryContact);
      }
      if (!secondaryContact) {
        secondaryContact = createSecondaryContact(this.store);
        _position.contacts.pushObject(secondaryContact);
      }
      let address = await primaryContact.contactAddress;
      if (!address) {
        address = this.store.createRecord('address');
        primaryContact.contactAddress = address;
      }
      let contact = {
        _position,
        title: position.title,
        primaryContact: createValidatedChangeset(
          primaryContact,
          contactValidations
        ),
        address: createValidatedChangeset(address, getAddressValidations()),
        secondaryContact: createValidatedChangeset(
          secondaryContact,
          contactValidations
        ),
      };
      contacts.push(contact);
    }

    return {
      person: createValidatedChangeset(person, personValidations),
      contacts,
    };
  }
}
