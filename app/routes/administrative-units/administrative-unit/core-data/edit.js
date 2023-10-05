import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { createAddress } from 'frontend-organization-portal/models/address';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import { getAddressValidations } from 'frontend-organization-portal/validations/address';
import contactValidations from 'frontend-organization-portal/validations/contact-point';
import administrativeUnitValidations, {
  getStructuredIdentifierKBOValidations,
} from 'frontend-organization-portal/validations/administrative-unit';
import { A } from '@ember/array';
import secondaryContactValidations from 'frontend-organization-portal/validations/secondary-contact-point';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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

    let identifierKBO = identifiers.find(
      ({ idName }) => idName === ID_NAME.KBO
    );
    let structuredIdentifierKBO = await identifierKBO.structuredIdentifier;

    let identifierSharepoint = identifiers.find(
      ({ idName }) => idName === ID_NAME.SHAREPOINT
    );
    let structuredIdentifierSharepoint =
      await identifierSharepoint.structuredIdentifier;

    let identifierNIS = identifiers.find(
      ({ idName }) => idName === ID_NAME.NIS
    );
    let structuredIdentifierNIS = await identifierNIS.structuredIdentifier;

    let identifierOVO = identifiers.find(
      ({ idName }) => idName === ID_NAME.OVO
    );
    let structuredIdentifierOVO = await identifierOVO.structuredIdentifier;

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
      )[0];
      const scope = await municipalityUnit.scope;
      igsRegio = await scope.locatedWithin;
    }

    return {
      administrativeUnit: createValidatedChangeset(
        administrativeUnit,
        administrativeUnitValidations
      ),
      address: createValidatedChangeset(address, getAddressValidations(true)),
      contact: createValidatedChangeset(primaryContact, contactValidations),
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        secondaryContactValidations
      ),
      identifierKBO,
      identifierSharepoint,
      identifierNIS,
      identifierOVO,
      structuredIdentifierKBO: createValidatedChangeset(
        structuredIdentifierKBO,
        getStructuredIdentifierKBOValidations(this.store)
      ),
      structuredIdentifierSharepoint,
      structuredIdentifierNIS,
      structuredIdentifierOVO,
      igsRegio,
    };
  }

  createMissingIdentifiers(currentIdentifiers) {
    const requiredIdNames = [
      ID_NAME.KBO,
      ID_NAME.SHAREPOINT,
      ID_NAME.NIS,
      ID_NAME.OVO,
    ];

    return requiredIdNames.reduce((missingIdentifiers, requiredIdName) => {
      let identifier = currentIdentifiers.find(
        ({ idName }) => idName === requiredIdName
      );

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
