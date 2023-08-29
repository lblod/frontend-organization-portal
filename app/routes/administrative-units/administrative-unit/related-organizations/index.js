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
    relationType: { refreshModel: true, replace: true },
  };

  async model(params) {
    const administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    const isAssociatedWith = await administrativeUnit.isAssociatedWith;

    const membershipsAsMemberOf =
      await administrativeUnit.membershipsOfOrganization;

    let membershipHasRelationWith = null;
    if (membershipsAsMemberOf.length) {
      for (const membership of membershipsAsMemberOf.toArray()) {
        const role = await membership.role;
        if (role.hasRelationWith) {
          membershipHasRelationWith = membership;
          break;
        }
      }
    }

    let wasFoundedByOrganization = null;
    if (membershipsAsMemberOf.length) {
      for (const membership of membershipsAsMemberOf.toArray()) {
        const role = await membership.role;
        if (role.isFounderOf) {
          wasFoundedByOrganization = membership;
          break;
        }
      }
    }

    const membershipsAsOrganization =
      await this.loadMembershipsAsOrganizationTask.perform(
        administrativeUnit.id,
        params,
        administrativeUnit.classification.get('id') ==
          CLASSIFICATION_CODE.PROVINCE
      );

    // TODO it broke the pagination and sorting of tables because now a table is a gropument of models ...
    // Might get fixable more easily once the model of relationships is unified. Wait for it to see.

    return {
      administrativeUnit,
      isAssociatedWith,
      membershipHasRelationWith,
      wasFoundedByOrganization,
      relatedMemberships: membershipsAsOrganization,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadMembershipsAsOrganizationTask(id, params, isProvince = false) {
    if (isProvince) {
      // TODO maybe do it in two queries for sub org of sub org ?
      /*       return yield this.store.query('administrative-unit', {
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
      }); */
    }
    return yield this.store.query('membership', {
      'filter[:or:][organization][:id:]': id,
      'filter[member][organization-status][:id:]': params.organizationStatus
        ? '63cc561de9188d64ba5840a42ae8f0d6'
        : undefined,
    });
    // TODO add sorting and pagination
  }
}
