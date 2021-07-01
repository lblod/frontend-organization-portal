import Route from '@ember/routing/route';

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexRoute extends Route {
  model() {
    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit.core-data'
      ),
    };
  }
}
