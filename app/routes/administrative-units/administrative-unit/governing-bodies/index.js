import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesIndexRoute extends Route {
  @service store;

  async model() {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      administrativeUnitId,
      {
        reload: true,
        include: 'governing-bodies.has-time-specializations',
      }
    );

    return {
      administrativeUnit: administrativeUnit,
      governingBody: await administrativeUnit.governingBodies.firstObject,
    };
  }
}
