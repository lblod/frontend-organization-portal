import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { query } from '@warp-drive/legacy/compat/builders';

export default class OrganizationsOrganizationChangeEventsIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    const { content: changeEventResults } = await this.store.request(
      query('change-event-result', {
        'filter[resulting-organization][:id:]': organizationId,
        include: ['result-from.type', 'status', 'resulting-organization'].join(),
        page: {
          number: params.page,
          size: params.size,
        },
        sort: params.sort,
      }),
    );

    return {
      organization: this.modelFor('organizations.organization'),
      changeEventResults,
    };
  }
}
