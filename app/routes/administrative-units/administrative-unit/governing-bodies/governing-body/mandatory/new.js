import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryNewRoute extends Route {
  @service store;

  async model() {
    let { governingBody } = this.modelFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );

    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit'
      ),
      governingBody,
      mandatory: this.store.createRecord('worship-mandatory'),
      contact: this.store.createRecord('contact-point'),
      contactMobile: this.store.createRecord('contact-point'),
      address: this.store.createRecord('address'),
      halfElectionTypes: await this.store.findAll('half-election'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
