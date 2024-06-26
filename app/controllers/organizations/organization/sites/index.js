import Controller from '@ember/controller';

export default class OrganizationsOrganizationSitesIndexController extends Controller {
  get sites() {
    let sites = [];

    if (this.model.primarySite) {
      sites = [this.model.primarySite];
    }

    if (this.model.sites.length > 0) {
      sites = [...sites, ...this.model.sites.slice()];
    }

    return sites;
  }
}
