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
import { A } from '@ember/array';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

import { action } from '@ember/object';

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

  @action
  willTransition() {
    // controller needs to be reset before index model hook is called
    // willTransition is the first hook called when transitioning to another route
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controller.reset();
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

    let identifierNIS = identifiers.findBy('idName', ID_NAME.NIS);
    let structuredIdentifierNIS = await identifierNIS.structuredIdentifier;

    let identifierOVO = identifiers.findBy('idName', ID_NAME.OVO);
    let structuredIdentifierOVO = await identifierOVO.structuredIdentifier;

    let region;

    if (administrativeUnit.isIgs || administrativeUnit.isOcmwAssociation) {
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
      region = await scope.locatedWithin;
    }

    return {
      administrativeUnit,
      address,
      contact: primaryContact,
      secondaryContact,
      identifierKBO,
      identifierSharepoint,
      identifierNIS,
      identifierOVO,
      structuredIdentifierKBO,
      structuredIdentifierSharepoint,
      structuredIdentifierNIS,
      structuredIdentifierOVO,
      region,
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
