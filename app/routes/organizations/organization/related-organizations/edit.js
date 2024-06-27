import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationRelatedOrganizationsEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    organizationStatus: { refreshModel: true, replace: true },
  };

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model(params) {
    const organization = this.modelFor('organizations.organization');

    const query = {
      'filter[:or:][memberships][member][:id:]': organization.id,
      'filter[:or:][memberships-of-organizations][organization][:id:]':
        organization.id,
      'filter[organization-status][:id:]': params.organizationStatus
        ? '63cc561de9188d64ba5840a42ae8f0d6' // active
        : undefined,
      include: [
        'memberships.role',
        'memberships.member',
        'memberships.organization',
        'memberships-of-organizations.role',
        'memberships-of-organizations.member',
        'memberships-of-organizations.organization',
      ].join(),
      sort: params.sort,
      page: { size: params.size, number: params.page },
    };

    const relatedOrganizations = await this.store.query('organization', query);

    // TODO: retrieve in component instead
    let roles = await this.store.findAll('membership-role');
    // Limit to membership roles concerning related organizations, excluding
    // the roles concerning positions
    roles = roles.filter((role) => role.opLabel);

    return {
      organization,
      relatedOrganizations,
      roles,
    };
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setup(model);
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
