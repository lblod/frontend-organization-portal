import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteRoute extends Route {
  @service store;

  async model({ siteId }) {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let site = await this.store.findRecord('site', siteId, {
      reload: true,
      include: ['address', 'contacts', 'site-type'].join(),
    });

    let contacts = await site.contacts;

    return {
      site,
      primaryContact: findPrimaryContact(contacts),
      secondaryContact: findSecondaryContact(contacts),
      administrativeUnit: administrativeUnit,
    };
  }
}
