import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationRelatedOrganizationsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    organizationStatus: { refreshModel: true, replace: true },
  };

  async model() {
    const organization = this.modelFor('organizations.organization');

    // TODO: move logic to somewhere else?
    const memberships = await organization.memberships;
    const membershipsOfOrganizations =
      await organization.membershipsOfOrganizations;

    const membershipsUnionMembershipsOfOrganizations = [
      ...memberships,
      ...membershipsOfOrganizations,
    ];

    return {
      organization,
      membershipsUnionMembershipsOfOrganizations,
    };
  }
}
