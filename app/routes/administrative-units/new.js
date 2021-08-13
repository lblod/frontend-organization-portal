import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const ID_NAME = {
  SHAREPOINT: 'SharePoint identificator',
  KBO: 'KBO nummer',
};

export default class AdministrativeUnitsNewRoute extends Route {
  @service store;

  model() {
    return {
      administrativeUnit: this.store.createRecord(
        'worship-administrative-unit'
      ),
      worshipService: this.store.createRecord('worship-service', {
        crossBorder: false,
      }),
      centralWorshipService: this.store.createRecord('central-worship-service'),
      primarySite: this.store.createRecord('site'),
      address: this.store.createRecord('address'),
      contact: this.store.createRecord('contact-point'),
      identifierKBO: this.store.createRecord('identifier', {
        idName: ID_NAME.KBO,
      }),
      structuredIdentifierKBO: this.store.createRecord('structured-identifier'),
      identifierSharepoint: this.store.createRecord('identifier', {
        idName: ID_NAME.SHAREPOINT,
      }),
      structuredIdentifierSharepoint: this.store.createRecord(
        'structured-identifier'
      ),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
