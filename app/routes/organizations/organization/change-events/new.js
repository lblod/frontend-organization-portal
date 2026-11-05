import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class OrganizationsOrganizationChangeEventsNewRoute extends Route {
  @service currentSession;
  @service router;
  @service store;
  @service scopeOfOperation;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('unauthorized');
    }
  }

  async model() {
    let organization = this.modelFor('organizations.organization');
    let currentScopeLabel =
      await this.scopeOfOperation.getScopeLabel(organization);
    let changeEvent = this.store.createRecord('change-event', {
      originalOrganizations: [organization],
    });
    let decision = this.store.createRecord('decision');
    decision.documentLinks = [''];
    let decisionActivity = this.store.createRecord('decision-activity');

    return {
      organization,
      changeEvent,
      decision,
      decisionActivity,
      currentScopeLabel,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);

    controller.reset();
  }
}
