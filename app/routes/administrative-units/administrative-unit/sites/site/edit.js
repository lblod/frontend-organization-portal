import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import siteValidations from 'frontend-contact-hub/validations/site';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditRoute extends Route {
  @service store;

  async model() {
    let { site } = this.modelFor(
      'administrative-units.administrative-unit.sites.site'
    );
    let contacts = await site.get('contacts');
    if (contacts.length === 0) {
      contacts.pushObject(this.store.createRecord('contact-point'));
    }
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    return {
      site: createValidatedChangeset(site, siteValidations),
      administrativeUnit,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }
}
