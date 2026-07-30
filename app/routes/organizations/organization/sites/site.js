import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class OrganizationsOrganizationSitesSiteRoute extends Route {
  @service store;

  async model({ siteId }) {
    let organization = this.modelFor('organizations.organization');

    const { content: site } = await this.store.request(
      findRecord('site', siteId, {
        reload: true,
        include: ['address', 'contacts', 'site-type'].join(),
      }),
    );

    let contacts = await site.contacts;

    return {
      site,
      primaryContact: findPrimaryContact(contacts),
      secondaryContact: findSecondaryContact(contacts),
      organization,
    };
  }
}
