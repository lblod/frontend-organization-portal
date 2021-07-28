import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsIndexRoute extends Route {
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
          'involvements,involvements.involvement-type,involvements.administrative-unit.classification',
      }
    );

    return {
      administrativeUnit: administrativeUnit,
      involvements: await administrativeUnit.involvements,
    };
  }
}
