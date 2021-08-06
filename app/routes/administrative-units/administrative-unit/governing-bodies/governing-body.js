import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const MEMBER_ROLE_ID = '2e021095727b2464459a63e16ebeafd2';

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
        include: 'mandates,mandates.role-board,mandates.held-by',
      }
    );

    let mandates = await governingBody.mandates;
    let memberMandates = mandates.filter((mandate) => {
      return mandate.get('roleBoard.id') === MEMBER_ROLE_ID;
    });

    let otherMandates = mandates.filter((mandate) => {
      return mandate.get('roleBoard.id') !== MEMBER_ROLE_ID;
    });

    return {
      administrativeUnit,
      governingBodyClassification,
      governingBody,
      memberMandates,
      otherMandates,
    };
  }
}
