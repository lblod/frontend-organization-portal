import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import administrativeUnitValidations from 'frontend-organization-portal/validations/administrative-unit';
import { dropTask } from 'ember-concurrency';
import { A } from '@ember/array';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditRoute extends Route {
  @service currentSession;
  @service router;

  queryParams = {
    sort: { refreshModel: true },
  };

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model(params) {
    let administrativeUnit = await this.modelFor(
      'administrative-units.administrative-unit.related-organizations'
    );

    let clonedRelatedOrganizations = A();

    const subOrganizations = await this.loadSubOrganizationsTask.perform(
      administrativeUnit.id,
      params
    );

    for (const subOrganization of subOrganizations.toArray()) {
      // Using a cloning subterfuge otherwise the `relationType` gets overridden
      // if we have multiple times the same admin unit
      const clone = await this.cloneOrganization(subOrganization);
      clone.relationType = 'Heeft een relatie met';

      clonedRelatedOrganizations.pushObject(clone);
    }

    const hasParticipants = await this.loadHasParticipantsTask.perform(
      administrativeUnit.id,
      params
    );

    for (const participant of hasParticipants.toArray()) {
      // Using a cloning subterfuge otherwise the `relationType` gets overridden
      // if we have multiple times the same admin unit
      const clone = await this.cloneOrganization(participant);
      clone.relationType = 'Heeft als participanten';

      clonedRelatedOrganizations.pushObject(clone);
    }

    const participatesIn = await administrativeUnit.participatesIn;
    for (const participant of participatesIn.toArray()) {
      // Using a cloning subterfuge otherwise the `relationType` gets overridden
      // if we have multiple times the same admin unit
      const clone = await this.cloneOrganization(participant);
      clone.relationType = 'Participeert in';

      clonedRelatedOrganizations.push(clone);
    }

    return {
      administrativeUnit: createValidatedChangeset(
        administrativeUnit,
        administrativeUnitValidations
      ),
      clonedRelatedOrganizations,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id, params) {
    return yield this.store.query('administrative-unit', {
      'filter[is-sub-organization-of][:id:]': id,
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

  async cloneOrganization(organization) {
    const clone = this.store.createRecord('organization');

    clone.opUuid = organization.id;
    clone.name = organization.name;
    clone.organizationStatus = await organization.organizationStatus;
    clone.classification = await organization.classification;

    return clone;
  }
}
