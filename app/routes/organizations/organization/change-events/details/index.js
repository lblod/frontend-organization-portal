import Route from '@ember/routing/route';

export default class OrganizationsOrganizationChangeEventsDetailsIndexRoute extends Route {
  model() {
    return this.modelFor('organizations.organization.change-events.details');
  }
}
