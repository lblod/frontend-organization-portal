import Route from '@ember/routing/route';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyIndexRoute extends Route {
  model() {
    return this.modelFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );
  }
}
