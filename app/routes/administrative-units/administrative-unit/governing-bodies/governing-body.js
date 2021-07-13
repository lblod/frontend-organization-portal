import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyRoute extends Route {
  @service store;

  async model({ governingBodyId: govBodyTimeSpecId }) {
    let adminGovModel = this.modelFor(
      'administrative-units.administrative-unit.governing-bodies'
    );

    let govBodyTimeSpec = await this.store.findRecord(
      'governing-body',
      govBodyTimeSpecId,
      {
        reload: true,
        include: 'mandates,mandates.role-board,mandates.held-by',
      }
    );

    let mandates = await govBodyTimeSpec.mandates;

    let mandateLid = mandates.filter((mandate) => {
      return (
        mandate.get('roleBoard.label') ===
        'Bestuurslid van het bestuur van de eredienst'
      );
    });

    let mandatesOther = mandates.filter((mandate) => {
      return (
        mandate.get('roleBoard.label') !==
        'Bestuurslid van het bestuur van de eredienst'
      );
    });

    return {
      adminGovModel: adminGovModel,
      govBodyTimeSpec: govBodyTimeSpec,
      mandateLid: mandateLid,
      mandatesOther: mandatesOther,
    };
  }
}
