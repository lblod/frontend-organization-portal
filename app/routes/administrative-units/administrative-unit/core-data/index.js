import Route from '@ember/routing/route';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { A } from '@ember/array';

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexRoute extends Route {
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

    const changeEvents = (await administrativeUnit.changedBy).toArray();

    let isCity = false;
    for (const event of changeEvents) {
      const eventType = await event.type;
      const eventTypeId = eventType.id;

      if (eventTypeId == 'e4c3d1ef-a34d-43b0-a18c-f4e60e2c8af3') {
        isCity = true;
      }
    }

    return {
      administrativeUnit,
      isCity,
      primaryContact: findPrimaryContact(contacts),
      secondaryContact: findSecondaryContact(contacts),
    };
  }
}
