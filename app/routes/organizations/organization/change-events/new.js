import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationChangeEventsNewRoute extends Route {
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
    let organization = this.modelFor('organizations.organization');
    let changeEvent = this.store.createRecord('change-event', {
      originalOrganizations: [organization],
    });
    let decision = this.store.createRecord('decision');
    let decisionActivity = this.store.createRecord('decision-activity');

    return {
      organization,
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
