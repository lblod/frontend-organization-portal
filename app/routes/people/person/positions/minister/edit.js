import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import { getAddressValidations } from 'frontend-organization-portal/validations/address';
import contactValidations from 'frontend-organization-portal/validations/contact-point';
import ministerValidations from 'frontend-organization-portal/validations/minister';

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
    let primaryContact = findPrimaryContact(contacts);

    if (!primaryContact) {
      primaryContact = createPrimaryContact(this.store);
    }

    let secondaryContact = findSecondaryContact(contacts);
    if (!secondaryContact) {
      secondaryContact = createSecondaryContact(this.store);
    }

    let address = await primaryContact.contactAddress;

    if (!address) {
      address = this.store.createRecord('address');
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
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        contactValidations
      ),
      secondaryContactRecord: secondaryContact,
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
