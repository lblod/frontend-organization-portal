import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class OrganizationsOrganizationRelatedOrganizationsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    organizationStatus: { refreshModel: true, replace: true },
  };

  async model(params) {
    const organization = this.modelFor('organizations.organization');

    const isAssociatedWith = await organization.isAssociatedWith;
    const isSubOrganizationOf = await organization.isSubOrganizationOf;

    const wasFoundedByOrganizations =
      await this.loadFoundedOrganizationsTask.perform(organization.id, params);

    const subOrganizations = await this.loadSubOrganizationsTask.perform(
      organization.id,
      params,
      organization.isProvince,
      organization.isRepresentativeOrgan
    );

    const participatesIn = await this.loadParticipatesInTask.perform(
      organization.id,
      params
    );

    const hasParticipants = await this.loadHasParticipantsTask.perform(
      organization.id,
      params
    );

    return {
      organization,
      wasFoundedByOrganizations,
      isAssociatedWith,
      isSubOrganizationOf,
      subOrganizations,
      participatesIn,
      hasParticipants,
    };
  }

  // TODO: change 'administrative-unit' in queries to organization when classification is available
  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(
    id,
    params,
    isProvince = false,
    isRepresentativeBody = false
  ) {
    if (isProvince) {
      return yield this.store.query('administrative-unit', {
        'filter[:or:][is-sub-organization-of][:id:]': id,
        'filter[:or:][was-founded-by-organizations][:id:]': id,
        'filter[:or:][is-sub-organization-of][is-sub-organization-of][:id:]':
          id,
        'filter[organization-status][:id:]': params.organizationStatus
          ? '63cc561de9188d64ba5840a42ae8f0d6'
          : undefined,
        include: 'classification',
        sort: params.sort,
        page: { size: params.size, number: params.page },
      });
    }

    if (isRepresentativeBody) {
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

    return yield this.store.query('administrative-unit', {
      'filter[:or:][is-sub-organization-of][:id:]': id,
      'filter[:or:][was-founded-by-organizations][:id:]': id,
      'filter[organization-status][:id:]': params.organizationStatus
        ? '63cc561de9188d64ba5840a42ae8f0d6'
        : undefined,
      include: 'classification',
      sort: params.sort,
      page: { size: params.size, number: params.page },
    });
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadParticipatesInTask(id, params) {
    return yield this.store.query('administrative-unit', {
      'filter[has-participants][:id:]': id,
      'page[size]': 500,
      include: 'classification',
      sort: params.sort,
    });
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadHasParticipantsTask(id, params) {
    return yield this.store.query('administrative-unit', {
      'filter[participates-in][:id:]': id,
      'page[size]': 500,
      include: 'classification',
      sort: params.sort,
    });
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadFoundedOrganizationsTask(id, params) {
    return yield this.store.query('administrative-unit', {
      'filter[founded-organizations][:id:]': id,
      'page[size]': 500,
      include: 'classification',
      sort: params.sort,
    });
  }
}
