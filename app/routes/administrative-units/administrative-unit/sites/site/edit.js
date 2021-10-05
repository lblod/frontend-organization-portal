import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import siteValidations, {
  addressValidations,
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
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let address = await site.address;

    return {
      site: createValidatedChangeset(site, siteValidations),
      address: createValidatedChangeset(address, addressValidations),
      contacts,
      administrativeUnit,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }
}
