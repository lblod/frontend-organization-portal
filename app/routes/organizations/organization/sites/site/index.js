import Route from '@ember/routing/route';

export default class OrganizationsOrganizationSitesSiteIndexRoute extends Route {
  model() {
    return this.modelFor('organizations.organization.sites.site');
  }
}
