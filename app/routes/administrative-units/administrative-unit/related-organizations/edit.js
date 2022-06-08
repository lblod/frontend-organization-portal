import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import worshipAdministrativeUnitValidations from 'frontend-organization-portal/validations/worship-administrative-unit';
import administrativeUnitValidations from 'frontend-organization-portal/validations/administrative-unit';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { dropTask } from 'ember-concurrency';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditRoute extends Route {
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    let administrativeUnit = await this.modelFor(
      'administrative-units.administrative-unit.related-organizations'
    );

    const subOrganizations = (
      await this.loadSubOrganizationsTask.perform(administrativeUnit.id)
    ).toArray();

    const classification = await administrativeUnit.classification;
    const isWorshipAdministrativeUnit =
      classification.id === CLASSIFICATION_CODE.WORSHIP_SERVICE ||
      classification.id === CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE;

    if (isWorshipAdministrativeUnit) {
      return {
        administrativeUnit: createValidatedChangeset(
          administrativeUnit,
          worshipAdministrativeUnitValidations
        ),
        subOrganizations,
      };
    } else {
      return {
        administrativeUnit: createValidatedChangeset(
          administrativeUnit,
          administrativeUnitValidations
        ),
        subOrganizations,
      };
    }
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id) {
    return yield this.store.query('administrative-unit', {
      'filter[is-sub-organization-of][:id:]': id,
      'page[size]': 500,
      include: 'classification',
    });
  }
}
