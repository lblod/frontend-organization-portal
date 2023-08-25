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
    const isSubOrganizationOf = await administrativeUnit.isSubOrganizationOf;
    const wasFoundedByOrganization =
      await administrativeUnit.wasFoundedByOrganization;

    let relatedOrganizations = [];

    // Note: we use labels here, it's not robus, but will change in a very near future because the model of
    // relationships is going to change
    if (
      !params.relationType ||
      params.relationType == 'Heeft een relatie met'
    ) {
      const subOrganizations = await this.loadSubOrganizationsTask.perform(
        administrativeUnit.id,
        params,
        administrativeUnit.classification.get('id') ==
          CLASSIFICATION_CODE.PROVINCE
      );
      for (const subOrganization of subOrganizations.toArray()) {
        // Using a cloning subterfuge otherwise the `relationType` gets overridden
        // if we have multiple times the same admin unit
        const clone = await this.cloneOrganization(subOrganization);
        clone.relationType = 'Heeft een relatie met';

        relatedOrganizations.push(clone);
      }
    }

    if (!params.relationType || params.relationType == 'Participeert in') {
      const participatesIn = await administrativeUnit.participatesIn;
      for (const participant of participatesIn.toArray()) {
        // Using a cloning subterfuge otherwise the `relationType` gets overridden
        // if we have multiple times the same admin unit
        const clone = await this.cloneOrganization(participant);
        clone.relationType = 'Participeert in';

        relatedOrganizations.push(clone);
      }
    }

    if (
      !params.relationType ||
      params.relationType == 'Heeft als participanten'
    ) {
      const hasParticipants = await this.loadHasParticipantsTask.perform(
        administrativeUnit.id,
        params
      );
      for (const participant of hasParticipants.toArray()) {
        // Using a cloning subterfuge otherwise the `relationType` gets overridden
        // if we have multiple times the same admin unit
        const clone = await this.cloneOrganization(participant);
        clone.relationType = 'Heeft als participanten';

        relatedOrganizations.push(clone);
      }
    }

    // TODO it broke the pagination and sorting of tables because now a table is a groument of models ...
    // Might get fixable more easily once the model of relationships is unified. Wait for it to see.

    return {
      administrativeUnit,
      wasFoundedByOrganization,
      isAssociatedWith,
      isSubOrganizationOf,
      relatedOrganizations,
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
  *loadHasParticipantsTask(id, params) {
    return yield this.store.query('administrative-unit', {
      'filter[participates-in][:id:]': id,
      'page[size]': 500,
      include: 'classification',
      sort: params.sort,
    });
  }

  async cloneOrganization(organization) {
    const clone = this.store.createRecord('organization');

    clone.opUuid = organization.id;
    clone.name = organization.name;
    clone.organizationStatus = await organization.organizationStatus;
    clone.classification = await organization.classification;

    return clone;
  }
}
