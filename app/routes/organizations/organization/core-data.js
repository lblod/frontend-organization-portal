import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';

export default class OrganizationsOrganizationCoreDataRoute extends Route {
  @service store;

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    const { content: organization } = await this.store.request(
      findRecord('organization', organizationId, {
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
          'content-themes',
        ].join(),
      }),
    );

    return organization;
  }
}
