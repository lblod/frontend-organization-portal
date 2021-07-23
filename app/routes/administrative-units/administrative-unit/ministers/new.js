import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitMinistersNewRoute extends Route {
  @service store;

  model() {
    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit'
      ),
      minister: this.store.createRecord('minister'),
      contact: this.store.createRecord('contact-point'),
      contactMobile: this.store.createRecord('contact-point'),
      address: this.store.createRecord('address'),
      position: this.store.createRecord('minister-position'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
