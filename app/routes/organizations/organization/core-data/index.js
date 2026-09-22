import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class OrganizationsOrganizationCoreDataIndexRoute extends Route {
  @service scopeOfOperation;

  async model() {
    let organization = this.modelFor('organizations.organization.core-data');

    const primarySite = await organization.primarySite;
    const contacts = (await primarySite?.contacts) ?? [];

    let resultedFrom = (await organization.resultedFrom).slice();
    resultedFrom = resultedFrom.sort((a1, a2) => {
      if (!a2.date) {
        return -1;
      }
      if (!a1.date) {
        return 1;
      }
      return new Date(a2.date).getTime() - new Date(a1.date).getTime();
    });

    const changeEvents = (await organization.changedBy).slice();

    let isCity = false;
    for (const event of changeEvents) {
      if (event.type.id == CHANGE_EVENT_TYPE.CITY) {
        isCity = true;
      }
    }

    // `displayRegion` is derived from the organization's classification, so make
    // sure that relationship is loaded before render (incl. in-app navigation).
    await organization.classification;

    // Reference regions (nl. referentieregio's) are derived from the
    // organization's werkingsgebied; an organization can cover multiple of them.
    const regions =
      await this.scopeOfOperation.getReferentieregiosInScope(organization);

    const scopeLabel = await this.scopeOfOperation.getScopeLabel(organization);

    const kboOrganization = await organization.kboOrganization;
    const kboContacts = (await kboOrganization?.contacts) ?? [];

    const vendors = await organization.vendors;
    const contentThemes = await organization.contentThemes;

    return {
      organization,
      kboOrganization,
      resultedFrom,
      isCity,
      primaryContact: findPrimaryContact(contacts),
      secondaryContact: findSecondaryContact(contacts),
      regions,
      scopeLabel,
      kboContact: findPrimaryContact(kboContacts),
      vendors,
      contentThemes,
    };
  }
}
