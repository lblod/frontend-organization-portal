import Route from '@ember/routing/route';

export default class OrganizationsOrganizationCoreDataRoute extends Route {
  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');
    return {
      representativeBody: await this.store.findRecord(
        'representative-body',
        organizationId,
        {
          reload: true,
          include: [
            'organization-status',
            'recognized-worship-type',
            'identifiers.structured-identifier',
            'primary-site.address',
            'primary-site.contacts',
            'resulted-from',
          ].join(),
        }
      ),
    };
  }
}
