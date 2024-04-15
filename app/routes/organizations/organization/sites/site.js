import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class OrganizationsOrganizationSitesSiteRoute extends Route {
  @service store;

  async model({ siteId }) {
    let organization = this.modelFor('organizations.organization');

    let site = await this.store.findRecord('site', siteId, {
      reload: true,
      include: ['address', 'contacts', 'site-type'].join(),
    });

    let contacts = await site.contacts;

    return {
      site,
      primaryContact: findPrimaryContact(contacts),
      secondaryContact: findSecondaryContact(contacts),
      organization,
    };
  }
}
