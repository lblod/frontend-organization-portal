import Route from '@ember/routing/route';

export default class OrganizationsOrganizationRoute extends Route {
  async model(params) {
    return {
      representativeBody: await this.store.findRecord(
        'representative-body',
        params.id
      ),
    };
  }
}
