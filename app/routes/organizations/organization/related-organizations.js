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
    return {
      loadSubOrganizationsTaskInstance: this.loadSubOrganizationsTask.perform(
        organization.id,
        params
      ),
      organization,
      subOrganizations: this.loadSubOrganizationsTask.lastSuccessful?.value,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id, params) {
    return yield this.store.query('administrative-unit', {
      'filter[:or:][is-associated-with][:id:]': id,
      'filter[:or:][founded-organizations][:id:]': id,
      include: ['classification', 'organization-status'].join(),
      sort: params.sort,
      page: { size: params.size, number: params.page },
    });
  }
}
