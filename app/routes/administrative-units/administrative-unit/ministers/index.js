import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { addPaginationMeta } from 'frontend-contact-hub/utils/data-table';

export default class AdministrativeUnitsAdministrativeUnitMinistersIndexRoute extends Route {
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
        include:
          'minister-positions.function,minister-positions.held-by-ministers',
      }
    );

    let ministerPositions = await administrativeUnit.ministerPositions;
    addPaginationMeta(ministerPositions);

    return {
      administrativeUnit: administrativeUnit,
      ministerPositions,
    };
  }
}
