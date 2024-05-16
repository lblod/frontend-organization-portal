import Route from '@ember/routing/route';

export default class OrganizationsOrganizationGoverningBodiesIndexRoute extends Route {
  model() {
    return this.modelFor('organizations.organization.governing-bodies');
  }
}
