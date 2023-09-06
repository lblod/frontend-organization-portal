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
      return yield this.store.query('membership', {
        'filter[:or:][organization][:id:]': id,
        'filter[member][organization-status][:id:]': params.organizationStatus
          ? '63cc561de9188d64ba5840a42ae8f0d6'
          : undefined,
        sort: params.sort,
        page: { size: params.size, number: params.page },
      });

      // TODO add districts for provinces
      // Probably something as follows but this returns a 500
      /*       const districts = yield this.store.query('membership', {
        'filter[:or:][organization][memberships-of-organization][organization][:id:]':
          id,
        'filter[:or:][organization][memberships-of-organization][organization][classification][:id:]':
          '5ab0e9b8a3b2ca7c5e000003', // district
        'filter[member][organization-status][:id:]': params.organizationStatus
          ? '63cc561de9188d64ba5840a42ae8f0d6'
          : undefined,
        sort: params.sort,
        page: { size: params.size, number: params.page },
      }); */
    }
    return yield this.store.query('membership', {
      'filter[:or:][organization][:id:]': id,
      'filter[member][organization-status][:id:]': params.organizationStatus
        ? '63cc561de9188d64ba5840a42ae8f0d6'
        : undefined,
      sort: params.sort,
      page: { size: params.size, number: params.page },
    });
    // TODO sorting breaks for type organisatie, I don't get why at first sight
  }
}
