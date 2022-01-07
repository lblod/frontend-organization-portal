import Route from '@ember/routing/route';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsIndexRoute extends Route {
  model() {
    return this.modelFor(
      'administrative-units.administrative-unit.change-events.details'
    );
  }
}
