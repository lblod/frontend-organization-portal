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

    // TODO: consider active organizations filter
    const query = {
      'filter[:or:][organization][:id:]': organization.id,
      'filter[:or:][member][:id:]': organization.id,
      include:
        'member,member.classification,organization,organization.classification',
      sort: params.sort,
      page: { size: params.size, number: params.page },
    };

    const allMembershipRelations = await this.store.query('membership', query);

    return {
      organization,
      allMembershipRelations,
    };
  }
}
