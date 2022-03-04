import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contact-hub/models/contact-point';
import { createAddress } from 'frontend-contact-hub/models/address';
import { ID_NAME } from 'frontend-contact-hub/models/identifier';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import worshipAdministrativeUnitValidations from 'frontend-contact-hub/validations/worship-administrative-unit';
import administrativeUnitValidations, {
  getStructuredIdentifierKBOValidations,
} from 'frontend-contact-hub/validations/administrative-unit';
import { A } from '@ember/array';
import WorshipServiceModel from 'frontend-contact-hub/models/worship-service';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.core-data'
    );

    let primarySite = await administrativeUnit.primarySite;

    // TODO : "if" not needed when the data of all administrative units will be correct
    // they should all have a primary site on creation
    let address;
    let contacts;
    if (primarySite) {
      address = await primarySite.address;
      contacts = await primarySite.contacts;
    } else {
      address = createAddress(this.store);
      contacts = A();
    }

    let primaryContact = findPrimaryContact(contacts);
    if (!primaryContact) {
      primaryContact = createPrimaryContact(this.store);
    }

    let secondaryContact = findSecondaryContact(contacts);
    if (!secondaryContact) {
      secondaryContact = createSecondaryContact(this.store);
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
        administrativeUnit instanceof WorshipServiceModel
          ? worshipAdministrativeUnitValidations
          : administrativeUnitValidations      ),
      address: createValidatedChangeset(address, getAddressValidations(true)),
      contact: createValidatedChangeset(primaryContact, contactValidations),
      secondaryContact: createValidatedChangeset(
        secondaryContact,
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
