import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class OrganizationsOrganizationIndexRoute extends Route {
  @service router;

  beforeModel() {
    return this.router.replaceWith('organizations.organization.core-data');
  }
}
