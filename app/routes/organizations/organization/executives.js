import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationExecutivesRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    let organization = await this.store.findRecord(
      'organization',
      organizationId,
    );

    let functionaries = await this.store.query('functionary', {
      'filter[board-position][governing-bodies][is-time-specialization-of][administrative-unit][:id:]':
        organizationId,
      sort: params.sort,
      page: { number: params.page, size: params.size },
    });

    return {
      organization,
      functionaries,
    };
  }
}
