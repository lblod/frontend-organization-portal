import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesRoute extends Route {
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
        include:
          'governing-bodies.has-time-specializations,governing-bodies.classification',
      }
    );

    //worship services related administrative units only have one governing body and many nested governing bodies "has-time-specializations"
    let governingBody = await administrativeUnit.governingBodies.firstObject;

    return {
      administrativeUnit,
      governingBodies: await governingBody.hasTimeSpecializations,
      governingBodyClassification: await governingBody.classification,
    };
  }
}
