import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
        include: [
          'minister-positions.function',
          'minister-positions.held-by-ministers.person',
        ].join(),
      }
    );

    let ministerPositions = await administrativeUnit.ministerPositions;
    let ministers = [];

    for (const ministerPosition of ministerPositions.toArray()) {
      const heldByMinisters = await ministerPosition.heldByMinisters;
      if (heldByMinisters.length) {
        ministers.push(...heldByMinisters.toArray());
      }
    }

    return {
      administrativeUnit: administrativeUnit,
      ministers,
    };
  }
}
