import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import adminUnitSiteValidations from 'frontend-contact-hub/validations/site';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditRoute extends Route {
  @service store;

  async model() {
    let adminUnitSite = this.modelFor(
      'administrative-units.administrative-unit.sites.site'
    );

    let contacts = await adminUnitSite.site.get('contacts');
    if (contacts.length === 0) {
      contacts.pushObject(this.store.createRecord('contact-point'));
    }

    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    return {
      adminUnitSite: createValidatedChangeset(
        adminUnitSite,
        adminUnitSiteValidations
      ),
      administrativeUnit,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }
}
