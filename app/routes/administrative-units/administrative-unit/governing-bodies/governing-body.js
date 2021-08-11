import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyRoute extends Route {
  @service store;

  async model({ governingBodyId }) {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let { governingBodyClassification } = this.modelFor(
      'administrative-units.administrative-unit.governing-bodies'
    );

    let governingBody = await this.store.findRecord(
      'governing-body',
      governingBodyId,
      {
        reload: true,
        include: 'mandates.role-board,mandates.held-by.governing-alias',
      }
    );

    return {
      administrativeUnit,
      governingBodyClassification,
      governingBody,
    };
  }
}
