import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import {
  addressValidations,
  contactValidations,
} from 'frontend-contact-hub/validations/site';
export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditRoute extends Route {
  @service store;

  async model() {
    let { site } = this.modelFor(
      'administrative-units.administrative-unit.sites.site'
    );

    let contacts = await site.contacts;
    if (contacts.length === 0) {
      contacts.pushObject(this.store.createRecord('contact-point'));
    }
    let contact = await contacts.firstObject;

    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let address = await site.address;

    return {
      site,
      address: createValidatedChangeset(address, addressValidations),
      contact: createValidatedChangeset(contact, contactValidations),
      administrativeUnit,
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
