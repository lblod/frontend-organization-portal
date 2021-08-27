import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitSitesNewRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    return {
      administrativeUnit,
      site: this.store.createRecord('site'),
      address: this.store.createRecord('address'),
      contact: this.store.createRecord('contact-point'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
