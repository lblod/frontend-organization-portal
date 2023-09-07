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
      loadRelatedOrganizationsTaskInstance:
        this.loadRelatedOrganizationsTask.perform(organization.id, params),
      organization,
      relatedOrganizations:
        this.loadRelatedOrganizationsTask.lastSuccessful?.value,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadRelatedOrganizationsTask(id, params) {
    return yield this.store.query('organization', {
      'filter[is-associated-with][:id:]': id,
      'filter[organization-status][:id:]': params.organizationStatus
        ? '63cc561de9188d64ba5840a42ae8f0d6'
        : undefined,
      include: 'classification',
      sort: params.sort,
      page: { size: params.size, number: params.page },
    });
  }
}
