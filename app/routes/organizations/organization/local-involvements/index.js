import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationLocalInvolvementsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
  };

  async model(params) {
    const organization = this.modelFor('organizations.organization');

    const query = {
      include: 'involvement-type,administrative-unit.classification',
      filter: {
        ['worship-administrative-unit']: {
          [':id:']: organization.id,
        },
      },
      sort: params.sort,
      page: { size: params.size, number: params.page },
    };

    let involvements = await this.store.query('local-involvement', query);

    return {
      organization,
      involvements,
    };
  }
}
