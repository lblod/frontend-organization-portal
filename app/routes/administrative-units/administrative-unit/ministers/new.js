import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-contact-hub/models/contact-point';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import ministerValidations, {
  positionValidations,
} from 'frontend-contact-hub/validations/minister';

export default class AdministrativeUnitsAdministrativeUnitMinistersNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  async model({ personId }, transition) {
    if (personId) {
      transition.data.person = await this.store.findRecord('person', personId);
    }

    let minister = this.store.createRecord('minister');
    minister.isCurrentPosition = true;
    let contact = createPrimaryContact(this.store);
    let secondaryContact = createSecondaryContact(this.store);
    let address = this.store.createRecord('address');
    let position = this.store.createRecord('minister-position');

    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit'
      ),
      minister: createValidatedChangeset(minister, ministerValidations),
      ministerRecord: minister,
      contact: createValidatedChangeset(contact, contactValidations),
      contactRecord: contact,
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        contactValidations
      ),
      secondaryContactRecord: secondaryContact,
      address: createValidatedChangeset(address, getAddressValidations(false)),
      addressRecord: address,
      position: createValidatedChangeset(position, positionValidations),
      positionRecord: position,
    };
  }

  setupController(controller, model, transition) {
    super.setupController(...arguments);

    if (transition.data.person) {
      controller.targetPerson = transition.data.person;
    }
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
