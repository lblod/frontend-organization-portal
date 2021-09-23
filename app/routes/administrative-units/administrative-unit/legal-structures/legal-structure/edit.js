import Route from '@ember/routing/route';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import associatedStructureValidations from 'frontend-contact-hub/validations/associated-structure';

export default class AdministrativeUnitsAdministrativeUnitLegalStructuresLegalStructureEditRoute extends Route {
  model() {
    let { associatedStructure } = this.modelFor(
      'administrative-units.administrative-unit.legal-structures.legal-structure'
    );

    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    return {
      associatedStructure: createValidatedChangeset(
        associatedStructure,
        associatedStructureValidations
      ),
      administrativeUnit,
    };
  }
}
