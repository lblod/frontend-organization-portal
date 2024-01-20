import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsNewRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );
    let changeEvent = this.store.createRecord('change-event', {
      originalOrganizations: [administrativeUnit],
    });
    let decision = this.store.createRecord('decision');
    let decisionActivity = this.store.createRecord('decisionActivity');

    return {
      administrativeUnit,
      changeEvent,
      decision,
      decisionActivity,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);

    controller.reset();
  }
}
