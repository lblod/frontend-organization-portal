import Route from '@ember/routing/route';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteIndexRoute extends Route {
  model() {
    return this.modelFor('administrative-units.administrative-unit.sites.site');
  }
}
