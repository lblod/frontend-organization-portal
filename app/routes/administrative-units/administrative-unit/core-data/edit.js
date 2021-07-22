import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

const IDNAMES = {
  SHAREPOINT: 'SharePoint identificator',
  KBO: 'KBO nummer',
};

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.core-data'
    );

    let contacts = await administrativeUnit.get('primarySite.contacts');
    if (contacts.length === 0) {
      contacts.pushObject(this.store.createRecord('contact-point'));
    }

    let identifiers = await administrativeUnit.get('identifiers');
    if (identifiers.length === 1) {
      let idName;
      if (identifiers.firstObject.idName === IDNAMES.SHAREPOINT) {
        idName = IDNAMES.KBO;
      } else {
        idName = IDNAMES.SHAREPOINT;
      }
      let identifier = this.store.createRecord('identifier', {
        idName: idName,
      });
      let structuredIdentifier = this.store.createRecord(
        'structured-identifier'
      );
      identifier.structuredIdentifier = structuredIdentifier;

      identifiers.pushObject(identifier);
    }

    return {
      administrativeUnit,
    };
  }
}
