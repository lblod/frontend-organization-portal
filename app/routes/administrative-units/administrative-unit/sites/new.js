import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { contactValidations } from 'frontend-contact-hub/validations/site';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';

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
        getAddressValidations(true)
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
