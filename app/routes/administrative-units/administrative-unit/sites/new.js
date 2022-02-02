import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-contact-hub/models/contact-point';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';

export default class AdministrativeUnitsAdministrativeUnitSitesNewRoute extends Route {
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
  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    return {
      administrativeUnit,
      site: this.store.createRecord('site'),
      address: createValidatedChangeset(
        this.store.createRecord('address'),
        getAddressValidations(true)
      ),
      contact: createValidatedChangeset(
        createPrimaryContact(this.store),
        contactValidations
      ),
      secondaryContact: createValidatedChangeset(
        createSecondaryContact(this.store),
        contactValidations
      ),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
