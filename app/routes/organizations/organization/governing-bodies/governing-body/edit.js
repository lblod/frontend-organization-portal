import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyEditRoute extends Route {
  @service currentSession;
  @service router;
  @service organizationEdits;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      return this.router.transitionTo('unauthorized');
    }

    if (this.organizationEdits.isReadOnly) {
      return this.router.transitionTo(
        'organizations.organization.governing-bodies.governing-body',
      );
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
