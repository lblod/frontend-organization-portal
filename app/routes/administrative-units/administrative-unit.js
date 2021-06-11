import Route from '@ember/routing/route';

export default class AdministrativeUnitsAdministrativeUnitRoute extends Route {
  async model(params) {
    return this.store.findRecord('administrative-unit', params.id)
  }
}
