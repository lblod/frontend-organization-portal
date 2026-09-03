import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';

export default class OrganizationsOrganizationSitesIndexRoute extends Route {
  @service store;

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    const { content: organization } = await this.store.request(
      findRecord('organization', organizationId, {
        reload: true,
        include: [
          'primary-site.address',
          'primary-site.contacts',
          'primary-site.site-type',
          'sites.address',
          'sites.contacts',
          'sites.site-type',
        ].join(),
      }),
    );

    return {
      organization,
      primarySite: await organization.primarySite,
      sites: await organization.sites,
    };
  }
}
