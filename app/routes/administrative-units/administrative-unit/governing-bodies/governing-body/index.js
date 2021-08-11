import Route from '@ember/routing/route';

const MEMBER_ROLE_ID = '2e021095727b2464459a63e16ebeafd2';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyIndexRoute extends Route {
  async model() {
    let { administrativeUnit, governingBodyClassification, governingBody } =
      this.modelFor(
        'administrative-units.administrative-unit.governing-bodies.governing-body'
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
