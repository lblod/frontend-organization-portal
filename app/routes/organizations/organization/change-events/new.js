import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class OrganizationsOrganizationChangeEventsNewRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('unauthorized');
    }
  }

  async model() {
    let organization = this.modelFor('organizations.organization');
    let changeEvent = this.store.createRecord('change-event', {
      originalOrganizations: [organization],
    });
    let decision = this.store.createRecord('decision');
    decision.documentLinks.push('');

    return {
      organization,
      changeEvent,
      decision,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);

    controller.reset();
  }
}
