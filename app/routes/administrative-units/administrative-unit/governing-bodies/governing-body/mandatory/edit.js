import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditRoute extends Route {
  @service store;

  async model({ mandatoryId: mandatoryId }) {
    let { id: adminUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let adminUnit = this.store.findRecord('administrative-unit', adminUnitId);

    let { governingBodyId: govBodyTempId } = this.paramsFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );

    let govBodyTemp = await this.store.findRecord(
      'governing-body',
      govBodyTempId
    );

    let mandatory = await this.store.findRecord('mandatory', mandatoryId);

    return {
      adminUnit,
      govBodyTemp,
      mandatory,
      person: await mandatory.governingAlias,
    };
  }
}
