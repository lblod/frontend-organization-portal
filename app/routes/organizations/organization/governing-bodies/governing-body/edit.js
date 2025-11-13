import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyEditRoute extends Route {
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('unauthorized');
    }
  }

  async model() {
    const { organization, governingBodyClassification, governingBody } =
      await this.modelFor(
        'organizations.organization.governing-bodies.governing-body',
      );

    return {
      governingBody,
      governingBodyClassification,
      organization,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
