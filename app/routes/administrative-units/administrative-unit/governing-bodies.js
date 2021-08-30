import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { addPaginationMeta } from 'frontend-contact-hub/utils/data-table';

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

    let governingBodies = await governingBody.hasTimeSpecializations;
    addPaginationMeta(governingBodies);

    return {
      administrativeUnit,
      governingBodies,
      governingBodyClassification: await governingBody.classification,
    };
  }
}
