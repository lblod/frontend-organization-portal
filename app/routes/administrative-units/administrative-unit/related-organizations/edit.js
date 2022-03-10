import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import worshipAdministrativeUnitValidations from 'frontend-contact-hub/validations/worship-administrative-unit';

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

    return {
      administrativeUnit: createValidatedChangeset(
        administrativeUnit,
        worshipAdministrativeUnitValidations
      ),
      worshipAdministrativeUnitType: administrativeUnit.constructor.modelName,
    };
  }
}
