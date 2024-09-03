import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationSitesIndexRoute extends Route {
  @service store;

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    let organization = await this.store.findRecord(
      'organization',
      organizationId,
      {
        reload: true,
        include: [
          'primary-site.address',
          'primary-site.contacts',
          'primary-site.site-type',
          'sites.address',
          'sites.contacts',
          'sites.site-type',
        ].join(),
      },
    );

    return {
      organization,
      primarySite: await organization.primarySite,
      sites: await organization.sites,
    };
  }
}
