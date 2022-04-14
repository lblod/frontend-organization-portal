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

    // TODO: at the moment new administrative units don't have a governingBody set so this route breaks without this workaround
    // Remove this once we have a proper plan for newly created administrative units
    let governingBodies = governingBody
      ? (await governingBody.hasTimeSpecializations).toArray().sort((a, b) => {
          return b.endDate - a.endDate;
        })
      : [];

    return {
      administrativeUnit,
      governingBodies,
      governingBodyClassification: await governingBody?.classification,
    };
  }
}
