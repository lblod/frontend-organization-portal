import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationRelatedOrganizationsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    organizationStatus: { refreshModel: true, replace: true },
  };

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

    return {
      organization,
      relatedOrganizations,
    };
  }
}
