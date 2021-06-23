import Controller from '@ember/controller';

export default class AdministrativeUnitsAdministrativeUnitSitesIndexController extends Controller {
  get sites() {
    if (this.model.sites.length > 0) {
      return this.model.sites;
    }

    // use the primary site as a fallback
    if (this.model.primarySite) {
      return [this.model.primarySite];
    }

    return [];
  }
}
