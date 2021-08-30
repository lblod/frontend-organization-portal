import Controller from '@ember/controller';
import { addPaginationMeta } from 'frontend-contact-hub/utils/data-table';

export default class AdministrativeUnitsAdministrativeUnitSitesIndexController extends Controller {
  get sites() {
    let sites = [];

    if (this.model.primarySite) {
      sites = [this.model.primarySite];
    }

    if (this.model.sites.length > 0) {
      sites = [...sites, ...this.model.sites.toArray()];
    }

    addPaginationMeta(sites);

    return sites;
  }
}
