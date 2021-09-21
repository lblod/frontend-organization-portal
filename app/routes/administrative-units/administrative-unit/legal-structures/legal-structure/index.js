import Route from '@ember/routing/route';

export default class AdministrativeUnitsAdministrativeUnitLegalStructuresLegalStructureIndexRoute extends Route {
  model() {
    return this.modelFor(
      'administrative-units.administrative-unit.legal-structures.legal-structure'
    );
  }
}
