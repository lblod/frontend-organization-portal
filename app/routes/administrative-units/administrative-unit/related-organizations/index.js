import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    organizationStatus: { refreshModel: true, replace: true },
  };

  async model(params) {
    const administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    const isAssociatedWith = await administrativeUnit.isAssociatedWith;
    const isSubOrganizationOf = await administrativeUnit.isSubOrganizationOf;
    const wasFoundedByOrganization =
      await administrativeUnit.wasFoundedByOrganization;
    const subOrganizations = await this.loadSubOrganizationsTask.perform(
      administrativeUnit.id,
      params,
      administrativeUnit.classification.get('id') ==
        CLASSIFICATION_CODE.PROVINCE
    );

    const participatesIn = await this.loadParticipatesInTask.perform(
      administrativeUnit.id,
      params
    );

    const hasParticipants = await this.loadHasParticipantsTask.perform(
      administrativeUnit.id,
      params
    );

    return {
      administrativeUnit,
      wasFoundedByOrganization,
      isAssociatedWith,
      isSubOrganizationOf,
      subOrganizations,
      participatesIn,
      hasParticipants,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id, params, isProvince = false) {
    if (isProvince) {
      return yield this.store.query('administrative-unit', {
        'filter[:or:][is-sub-organization-of][:id:]': id,
        'filter[:or:][was-founded-by-organization][:id:]': id,
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
    return yield this.store.query('administrative-unit', {
      'filter[:or:][is-sub-organization-of][:id:]': id,
      'filter[:or:][was-founded-by-organization][:id:]': id,
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
}
