import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const MEMBER_ROLE_ID = '2e021095727b2464459a63e16ebeafd2';

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
      return mandate.get('roleBoard.id') === MEMBER_ROLE_ID;
    });

    let mandatesOther = mandates.filter((mandate) => {
      return mandate.get('roleBoard.id') !== MEMBER_ROLE_ID;
    });

    return {
      adminGovModel,
      govBodyTimeSpec,
      mandateLid,
      mandatesOther,
    };
  }
}
