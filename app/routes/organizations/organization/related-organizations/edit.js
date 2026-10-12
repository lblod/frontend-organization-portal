import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
import getFiltersForRoleLabel from 'frontend-organization-portal/utils/get-filters-for-role-label';

export default class OrganizationsOrganizationRelatedOrganizationsEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    selectedRoleLabel: { refreshModel: true, replace: true },
  };

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('unauthorized');
    }
  }

  async model(params) {
    const {
      organization,
      roles,
      selectableRoles,
      selectableRoleLabels,
      allowedRoleLabels,
    } = this.modelFor('organizations.organization.related-organizations');

    let query = {
      // The classifications are needed for the minimum check on removal: a
      // minimum restricted to certain types must not count an organization
      // whose classification is not loaded.
      include:
        'role,member,organization,member.classification,organization.classification',
      // sort: params.sort,
      page: { size: params.size, number: params.page },
    };

    const filters = getFiltersForRoleLabel({
      roles,
      organization,
      roleLabel: params.selectedRoleLabel,
    });

    filters.forEach((value, key) => (query[key] = value));

    const { content: memberships } = await this.store.request(
      queryBuilder('membership', query),
    );

    return {
      organization,
      memberships,
      roles,
      selectableRoles,
      selectableRoleLabels,
      allowedRoleLabels,
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
