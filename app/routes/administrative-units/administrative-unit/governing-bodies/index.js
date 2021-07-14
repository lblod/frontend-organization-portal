import Route from '@ember/routing/route';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesIndexRoute extends Route {
  model() {
    return this.modelFor(
      'administrative-units.administrative-unit.governing-bodies'
    );
  }
}
