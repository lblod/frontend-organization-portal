import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
      if (identifiers.firstObject.idName === 'SharePoint identificator') {
        idName = 'KBO nummer';
      } else {
        idName = 'SharePoint identificator';
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
