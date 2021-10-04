import Route from '@ember/routing/route';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import associatedStructureValidations, {
  legalTypeValidations,
} from 'frontend-contact-hub/validations/associated-structure';
export default class AdministrativeUnitsAdministrativeUnitLegalStructuresLegalStructureEditRoute extends Route {
  async model() {
    let { associatedStructure } = this.modelFor(
      'administrative-units.administrative-unit.legal-structures.legal-structure'
    );

    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let legalType = await associatedStructure.legalType;
    let address = await associatedStructure.address;

    return {
      associatedStructure: createValidatedChangeset(
        associatedStructure,
        associatedStructureValidations
      ),
      legalType: createValidatedChangeset(legalType, legalTypeValidations),
      address,
      administrativeUnit,
    };
  }
}
