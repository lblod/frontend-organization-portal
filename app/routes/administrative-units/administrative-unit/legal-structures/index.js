import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitLegalStructuresIndexRoute extends Route {
  @service store;

  async model() {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let administrativeUnit = await this.store.findRecord(
      'worship-service',
      administrativeUnitId,
      {
        reload: true,
        include: [
          'associated-structures.registration.structured-identifier',
          'associated-structures.legal-type',
          'associated-structures.address',
        ].join(),
      }
    );

    let associatedStructures = await administrativeUnit.associatedStructures;

    return {
      administrativeUnit: administrativeUnit,
      associatedStructures,
    };
  }
}
