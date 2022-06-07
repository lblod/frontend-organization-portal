import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import worshipAdministrativeUnitValidations from 'frontend-organization-portal/validations/worship-administrative-unit';
import administrativeUnitValidations from 'frontend-organization-portal/validations/administrative-unit';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.related-organizations'
    );

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
      };
    } else {
      return {
        administrativeUnit: createValidatedChangeset(
          administrativeUnit,
          administrativeUnitValidations
        ),
      };
    }
  }
}
