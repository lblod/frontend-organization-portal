import Route from '@ember/routing/route';

export default class AdministrativeUnitsAdministrativeUnitIndexRoute extends Route {

  model() {
    return this.modelFor('administrative-units.administrative-unit');
  }
}
