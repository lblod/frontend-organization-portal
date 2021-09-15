import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryNewRoute extends Route {
  @service store;

  async model({ personId }, transition) {
    let { governingBody } = this.modelFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );

    if (personId) {
      transition.data.person = await this.store.findRecord('person', personId);
    }

    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit'
      ),
      governingBody,
      mandatory: this.store.createRecord('worship-mandatory'),
      contact: this.store.createRecord('contact-point'),
      contactMobile: this.store.createRecord('contact-point'),
      address: this.store.createRecord('address'),
    };
  }

  setupController(controller, model, transition) {
    super.setupController(...arguments);

    if (transition.data.person) {
      controller.targetPerson = transition.data.person;
    }
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
