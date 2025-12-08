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
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

import { action } from '@ember/object';

export default class OrganizationsOrganizationCoreDataEditRoute extends Route {
  @service store;
  @service currentSession;
  @service router;
  @service scopeOfOperation;

  locationsInScope = [];

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('unauthorized');
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
    let organization = this.modelFor('organizations.organization.core-data');

    let primarySite = await organization.primarySite;

    // TODO: "if" not needed when the data of all organizations is correct, they
    // should all have a primary site on creation.
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

    let identifiers = await organization.identifiers;
    let missingIdentifiers = this.createMissingIdentifiers(identifiers);
    identifiers.push(...missingIdentifiers);

    let identifierKBO = identifiers.find(
      ({ idName }) => idName === ID_NAME.KBO,
    );
    let structuredIdentifierKBO = await identifierKBO.structuredIdentifier;

    let identifierSharepoint = identifiers.find(
      ({ idName }) => idName === ID_NAME.SHAREPOINT,
    );
    let structuredIdentifierSharepoint =
      await identifierSharepoint.structuredIdentifier;

    let identifierNIS = identifiers.find(
      ({ idName }) => idName === ID_NAME.NIS,
    );
    let structuredIdentifierNIS = await identifierNIS.structuredIdentifier;

    let identifierOVO = identifiers.find(
      ({ idName }) => idName === ID_NAME.OVO,
    );
    let structuredIdentifierOVO = await identifierOVO.structuredIdentifier;

    // Determine reference region for some classes of organizations
    // TODO: this is duplicate from the view route
    let region;
    if (organization.displayRegion) {
      let scope;
      if (organization.isMunicipality) {
        scope = await organization.scope;
      } else if (
        organization.isIgs ||
        organization.isOcmwAssociation ||
        organization.isPevaProvince ||
        organization.isPevaMunicipality
      ) {
        const address = await primarySite?.address;
        const municipalityString = address?.municipality;
        if (municipalityString) {
          const municipalityUnit = (
            await this.store.query('organization', {
              filter: {
                ':exact:name': municipalityString,
                classification: {
                  ':id:': CLASSIFICATION.MUNICIPALITY.id,
                },
              },
            })
          ).at(0);
          scope = await municipalityUnit.scope;
        }
      }
      const containingLocations = await scope.locatedWithin;
      // NOTE (03/06/2025): This relies on the fact that reference regions do
      // *not* overlap. In other words, an organisation cannot be located in
      // multiple reference regions.
      region = await containingLocations.find(
        (location) => location.level === 'Referentieregio',
      );
    }

    const provinceLocations = await this.store.query('location', {
      sort: 'label',
      filter: { level: 'Provincie' },
    });

    this.locationsInScope =
      await this.scopeOfOperation.getLocationsInScope(organization);

    const vendors = await organization.vendors;

    return {
      organization,
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
      provinceLocations,
      vendors,
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
        ({ idName }) => idName === requiredIdName,
      );

      if (!identifier) {
        identifier = this.store.createRecord('identifier', {
          idName: requiredIdName,
        });

        let structuredIdentifier = this.store.createRecord(
          'structured-identifier',
        );

        identifier.structuredIdentifier = structuredIdentifier;
        missingIdentifiers.push(identifier);
      }

      return missingIdentifiers;
    }, []);
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.set('locationsInScope', this.locationsInScope);
  }
}
