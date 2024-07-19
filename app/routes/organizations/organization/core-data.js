import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationCoreDataRoute extends Route {
  @service store;

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    return await this.store.findRecord('organization', organizationId, {
      reload: true,
      include: [
        'classification',
        'organization-status',
        'identifiers.structured-identifier',
        'primary-site.address',
        'primary-site.contacts',
        'resulted-from',
        'kbo-organization',
        'memberships-of-organizations',
        'memberships',
      ].join(),
    });
  }
}
