import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class OrganizationsOrganizationRelatedOrganizationsRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    organizationStatus: { refreshModel: true, replace: true },
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
      'filter[organization-status][:id:]': params.organizationStatus
        ? '63cc561de9188d64ba5840a42ae8f0d6'
        : undefined,
      include: 'classification',
      sort: params.sort,
      page: { size: params.size, number: params.page },
    });
  }
}
