import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ID_NAME } from 'frontend-contact-hub/models/identifier';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import worshipAdministrativeUnitValidations from 'frontend-contact-hub/validations/worship-administrative-unit';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.core-data'
    );

    let primarySite = await administrativeUnit.primarySite;
    let address = await primarySite.address;
    let contacts = await primarySite.contacts;
    if (contacts.length === 0) {
      contacts.pushObject(this.store.createRecord('contact-point'));
    }

    let identifiers = await administrativeUnit.identifiers;
    if (identifiers.length === 1) {
      let idName;
      if (identifiers.firstObject.idName === ID_NAME.SHAREPOINT) {
        idName = ID_NAME.KBO;
      } else {
        idName = ID_NAME.SHAREPOINT;
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
      administrativeUnit: createValidatedChangeset(
        administrativeUnit,
        worshipAdministrativeUnitValidations
      ),
      address: createValidatedChangeset(address, getAddressValidations(true)),
      contact: createValidatedChangeset(
        contacts.firstObject,
        contactValidations
      ),
      worshipAdministrativeUnitType: administrativeUnit.constructor.modelName,
    };
  }
}
