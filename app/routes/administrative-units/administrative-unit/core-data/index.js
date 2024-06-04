import Route from '@ember/routing/route';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { inject as service } from '@ember/service';
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.core-data'
    );

    const primarySite = await administrativeUnit.primarySite;
    const contacts = (await primarySite?.contacts) ?? [];

    let resultedFrom = (await administrativeUnit.resultedFrom).slice();
    resultedFrom = resultedFrom.sort((a1, a2) => {
      if (!a2.date) {
        return -1;
      }
      if (!a1.date) {
        return 1;
      }
      return new Date(a2.date).getTime() - new Date(a1.date).getTime();
    });

    const changeEvents = (await administrativeUnit.changedBy).slice();

    let isCity = false;
    for (const event of changeEvents) {
      const eventType = await event.type;
      const eventTypeId = eventType.id;

      if (eventTypeId == 'e4c3d1ef-a34d-43b0-a18c-f4e60e2c8af3') {
        isCity = true;
      }
    }

    let region;
    const typesThatAreIGS = [
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ];
    const isIGS = typesThatAreIGS.includes(
      administrativeUnit.classification?.get('id')
    );

    const isOcmwAssociation = OCMW_ASSOCIATION_CLASSIFICATION_CODES.includes(
      administrativeUnit.classification?.get('id')
    );

    if (
      isIGS ||
      isOcmwAssociation ||
      administrativeUnit.isPevaProvince ||
      administrativeUnit.isPevaMunicipality
    ) {
      const address = await primarySite?.address;
      const municipalityString = address?.municipality;
      if (municipalityString) {
        const municipalityUnit = (
          await this.store.query('administrative-unit', {
            filter: {
              ':exact:name': municipalityString,
              classification: {
                ':id:': CLASSIFICATION_CODE.MUNICIPALITY,
              },
            },
          })
        ).at(0);
        const scope = await municipalityUnit.scope;
        region = await scope.locatedWithin;
      }
    }

    const kboOrganization = await administrativeUnit.kboOrganization;
    const kboContacts = (await kboOrganization?.contacts) ?? [];

    return {
      administrativeUnit,
      kboOrganization,
      resultedFrom,
      isCity,
      primaryContact: findPrimaryContact(contacts),
      secondaryContact: findSecondaryContact(contacts),
      region,
      kboContact: findPrimaryContact(kboContacts),
    };
  }
}
