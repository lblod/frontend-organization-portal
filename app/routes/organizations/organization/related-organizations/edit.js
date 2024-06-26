import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import getFiltersForRoleLabel from 'frontend-organization-portal/utils/get-filters-for-role-label';

export default class OrganizationsOrganizationRelatedOrganizationsEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
  };

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model(params) {
    const { organization, roles } = this.modelFor(
      'organizations.organization.related-organizations'
    );

    let query = {
      include: 'role,member,organization',
      // sort: params.sort,
      page: { size: params.size, number: params.page },
    };

    const filters = getFiltersForRoleLabel({
      roles,
      organization,
      roleLabel: params.selectedRoleLabel,
    });

    filters.forEach((value, key) => (query[key] = value));

    const memberships = await this.store.query('membership', query);

    return {
      organization,
      memberships,
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
