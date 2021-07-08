import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.core-data'
    );

    let contacts = await administrativeUnit.get('primarySite.contacts');
    if (contacts.length === 0) {
      contacts.pushObject(this.store.createRecord('contact-point'));
    }

    return {
      administrativeUnit,
    };
  }
}
