import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class OrganizationsOrganizationRelatedOrganizationsRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
  };

  async model(params) {
    const organization = this.modelFor('organizations.organization');

    const subOrganizations = await this.loadSubOrganizationsTask.perform(
      organization.id,
      params
    );
    return {
      organization,
      subOrganizations,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id, params) {
    return yield this.store.query('administrative-unit', {
      'filter[is-associated-with][:id:]': id,
      include: 'classification',
      sort: params.sort,
      page: { size: 25, number: params.page },
    });
  }
}
