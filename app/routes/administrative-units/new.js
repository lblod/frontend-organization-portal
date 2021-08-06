import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsNewRoute extends Route {
  @service store;

  model() {
    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit'
      ),
      contact: this.store.createRecord('contact-point'),
      contactMobile: this.store.createRecord('contact-point'),
      address: this.store.createRecord('address'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
