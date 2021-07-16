import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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

    return adminUnitSite;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }
}
