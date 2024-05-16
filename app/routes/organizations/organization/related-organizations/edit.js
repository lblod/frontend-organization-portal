import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationRelatedOrganizationsEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    const { id: organizationId } = this.paramsFor('organizations.organization');

    const organization = await this.store.findRecord(
      'organization',
      organizationId,
      {
        reload: true,
        include: 'organization-status,was-founded-by-organizations',
      }
    );

    const subOrganizations = await organization.subOrganizations;
    const hasParticipants = await organization.hasParticipants;

    return {
      organization,
      subOrganizations,
      hasParticipants,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
