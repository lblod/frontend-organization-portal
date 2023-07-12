import Route from '@ember/routing/route';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexRoute extends Route {
  @service store;
  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.core-data'
    );

    let primarySite = await administrativeUnit.primarySite;

    // TODO : "if" not needed when the data of all administrative units will be correct
    // they should all have a primary site on creation
    let contacts = A();
    if (primarySite) {
      contacts = await primarySite.contacts;
    }

    let resultedFrom = (await administrativeUnit.resultedFrom).toArray();
    resultedFrom = resultedFrom.sort((a1, a2) => {
      if (!a2.date) {
        return -1;
      }
      if (!a1.date) {
        return 1;
      }
      return new Date(a2.date).getTime() - new Date(a1.date).getTime();
    });

    const changeEvents = (await administrativeUnit.changedBy).toArray();

    let isCity = false;
    for (const event of changeEvents) {
      const eventType = await event.type;
      const eventTypeId = eventType.id;

      if (eventTypeId == 'e4c3d1ef-a34d-43b0-a18c-f4e60e2c8af3') {
        isCity = true;
      }
    }
    let igsRegio;
    const typesThatAreIGS = [
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ];
    const isIGS = typesThatAreIGS.includes(
      administrativeUnit.classification?.get('id')
    );

    if (isIGS) {
      const primarySite = await administrativeUnit.primarySite;
      const address = await primarySite.address;
      const municipalityString = address.municipality;
      const municipalityUnit = (
        await this.store.query('administrative-unit', {
          filter: {
            ':exact:name': municipalityString,
            classification: {
              ':id:': CLASSIFICATION_CODE.MUNICIPALITY,
            },
          },
        })
      ).firstObject;
      const scope = await municipalityUnit.scope;
      igsRegio = await scope.locatedWithin;
    }

    return {
      administrativeUnit,
      resultedFrom,
      isCity,
      primaryContact: findPrimaryContact(contacts),
      secondaryContact: findSecondaryContact(contacts),
      igsRegio,
    };
  }
}
