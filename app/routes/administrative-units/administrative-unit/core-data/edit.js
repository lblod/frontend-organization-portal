import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ID_NAME } from 'frontend-contact-hub/models/identifier';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import worshipAdministrativeUnitValidations, {
  getStructuredIdentifierKBOValidations,
} from 'frontend-contact-hub/validations/worship-administrative-unit';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditRoute extends Route {
  @service store;
  @service currentSession;
  @service session;

  beforeModel() {
    if (!this.currentSession.hasAllowedRole) {
      this.session.invalidate();
    }
  }

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
    let missingIdentifiers = this.createMissingIdentifiers(identifiers);
    identifiers.pushObjects(missingIdentifiers);

    let identifierKBO = identifiers.findBy('idName', ID_NAME.KBO);
    let structuredIdentifierKBO = await identifierKBO.structuredIdentifier;

    let identifierSharepoint = identifiers.findBy('idName', ID_NAME.SHAREPOINT);
    let structuredIdentifierSharepoint =
      await identifierSharepoint.structuredIdentifier;

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
      identifierKBO,
      structuredIdentifierKBO: createValidatedChangeset(
        structuredIdentifierKBO,
        getStructuredIdentifierKBOValidations(this.store)
      ),
      identifierSharepoint,
      structuredIdentifierSharepoint,
      worshipAdministrativeUnitType: administrativeUnit.constructor.modelName,
    };
  }

  createMissingIdentifiers(currentIdentifiers) {
    const requiredIdNames = [ID_NAME.KBO, ID_NAME.SHAREPOINT];

    return requiredIdNames.reduce((missingIdentifiers, requiredIdName) => {
      let identifier = currentIdentifiers.findBy('idName', requiredIdName);

      if (!identifier) {
        identifier = this.store.createRecord('identifier', {
          idName: requiredIdName,
        });

        let structuredIdentifier = this.store.createRecord(
          'structured-identifier'
        );

        identifier.structuredIdentifier = structuredIdentifier;
        missingIdentifiers.push(identifier);
      }

      return missingIdentifiers;
    }, []);
  }
}
