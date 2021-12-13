import Route from '@ember/routing/route';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import ministerValidations from 'frontend-contact-hub/validations/minister';
import { findPrimaryContact } from 'frontend-contact-hub/utils/contact';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsMinisterEditRoute extends Route {
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
    let { minister } = this.modelFor('people.person.positions.minister');

    let contacts = await minister.contacts;
    let primaryContact = await findPrimaryContact(contacts.toArray());

    if (!primaryContact) {
      primaryContact = this.store.createRecord('contact-point');
      contacts.pushObject(primaryContact);
    }

    let address = await primaryContact.contactAddress;

    if (!address) {
      address = this.store.createRecord('address');
      primaryContact.contactAddress = address;
    }

    let ministerChangeset = createValidatedChangeset(
      minister,
      ministerValidations
    );
    ministerChangeset.isCurrentPosition = !minister.agentEndDate;

    return {
      minister: ministerChangeset,
      contact: createValidatedChangeset(primaryContact, contactValidations),
      contactRecord: primaryContact,
      address: createValidatedChangeset(address, getAddressValidations(false)),
      addressRecord: address,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
