import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import {
  addressValidations,
  contactValidations,
} from 'frontend-contact-hub/validations/site';

export default class AdministrativeUnitsAdministrativeUnitSitesNewRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    return {
      administrativeUnit,
      site: this.store.createRecord('site'),
      address: createValidatedChangeset(
        this.store.createRecord('address'),
        addressValidations
      ),
      contact: createValidatedChangeset(
        this.store.createRecord('contact-point'),
        contactValidations
      ),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
