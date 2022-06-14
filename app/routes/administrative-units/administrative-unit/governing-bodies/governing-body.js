import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyRoute extends Route {
  @service store;

  async model({ governingBodyId }) {
    const administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    const governingBody = await this.store.findRecord(
      'governing-body',
      governingBodyId,
      {
        reload: true,
        include: 'mandates.role-board,mandates.held-by.governing-alias',
      }
    );

    const governingBodyClassification = await governingBody.classification;

    return {
      administrativeUnit,
      governingBodyClassification,
      governingBody,
    };
  }
}
