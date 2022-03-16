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
import { SensitivePersonalInformation } from '../../../../services/sensitive-personal-information';
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
    let {
      person,
      positions,
      requestSensitiveInformation,
      askSensitiveInformation,
    } = this.modelFor('people.person.personal-information');
    const contacts = [];
    for (let computedPosition of positions) {
      let { primaryContact, secondaryContact, position } = computedPosition;
      if (!primaryContact) {
        primaryContact = createPrimaryContact(this.store);
        position.contacts.pushObject(primaryContact);
      }
      if (!secondaryContact) {
        secondaryContact = createSecondaryContact(this.store);
        position.contacts.pushObject(secondaryContact);
      }
      let address = await primaryContact.contactAddress;
      if (!address) {
        address = this.store.createRecord('address');
        primaryContact.contactAddress = address;
      }
      let contact = {
        position,
        title: computedPosition.title,
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
    let sensitiveInformation = requestSensitiveInformation;
    if (askSensitiveInformation?.isEmpty()) {
      sensitiveInformation = new SensitivePersonalInformation();
    }
    return {
      person: createValidatedChangeset(person, personValidations),
      contacts,
      sensitiveInformation: sensitiveInformation,
      askSensitiveInformation,
    };
  }

  resetController(controller) {
    controller.reset();
  }
}
