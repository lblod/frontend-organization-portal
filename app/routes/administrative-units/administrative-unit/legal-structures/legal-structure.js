import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitLegalStructuresLegalStructureRoute extends Route {
  @service store;

  async model({ legalStructureId }) {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let associatedStructure = await this.store.findRecord(
      'associated-legal-structure',
      legalStructureId,
      {
        reload: true,
        include: [
          'registration.structured-identifier',
          'legal-type',
          'address',
        ].join(),
      }
    );

    return {
      associatedStructure: associatedStructure,
      administrativeUnit: administrativeUnit,
    };
  }
}
