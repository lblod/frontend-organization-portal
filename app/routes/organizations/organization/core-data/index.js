import Route from '@ember/routing/route';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { inject as service } from '@ember/service';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class OrganizationsOrganizationCoreDataIndexRoute extends Route {
  @service store;
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
      const eventType = await event.type;
      const eventTypeId = eventType.id;

      if (eventTypeId == 'e4c3d1ef-a34d-43b0-a18c-f4e60e2c8af3') {
        isCity = true;
      }
    }

    let region;
    if (
      organization.isIgs ||
      organization.isOcmwAssociation ||
      organization.isPevaProvince ||
      organization.isPevaMunicipality
    ) {
      const address = await primarySite?.address;
      const municipalityString = address?.municipality;
      if (municipalityString) {
        const municipalityUnit = (
          await this.store.query('organization', {
            filter: {
              ':exact:name': municipalityString,
              classification: {
                ':id:': CLASSIFICATION.MUNICIPALITY.id,
              },
            },
          })
        ).at(0);
        const scope = await municipalityUnit.scope;
        region = await scope.locatedWithin;
      }
    }

    const scopeLabel = await this.scopeOfOperation.getScopeLabel(organization);

    const kboOrganization = await organization.kboOrganization;
    const kboContacts = (await kboOrganization?.contacts) ?? [];

    return {
      organization,
      kboOrganization,
      resultedFrom,
      isCity,
      primaryContact: findPrimaryContact(contacts),
      secondaryContact: findSecondaryContact(contacts),
      region,
      scopeLabel,
      kboContact: findPrimaryContact(kboContacts),
    };
  }
}
