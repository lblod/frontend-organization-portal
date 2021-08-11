import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsNewRoute extends Route {
  @service store;

  model() {
    return {
      administrativeUnit: this.store.createRecord(
        'worship-administrative-unit'
      ),
      worshipService: this.store.createRecord('worship-service'),
      centalWorshipService: this.store.createRecord('central-worship-service'),
      primarySite: this.store.createRecord('site'),
      address: this.store.createRecord('address'),
      contact: this.store.createRecord('contact-point'),
      structuredIdentifierKBO: this.store.createRecord('structured-identifier'),
      structuredIdentifierSharepoint: this.store.createRecord(
        'structured-identifier'
      ),
      identifierSharepoint: this.store.createRecord('identifier'),
      identifierKBO: this.store.createRecord('identifier'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
