import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const ID_NAME = {
  KBO: 'KBO nummer',
};

export default class AdministrativeUnitsAdministrativeUnitLegalStructuresNewRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    return {
      administrativeUnit,
      associatedStructure: this.store.createRecord(
        'associated-legal-structure'
      ),
      address: this.store.createRecord('address'),
      legalType: this.store.createRecord('legal-form-type'),
      registration: this.store.createRecord('identifier', {
        idName: ID_NAME.KBO,
      }),
      structuredIdentifier: this.store.createRecord('structured-identifier'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
