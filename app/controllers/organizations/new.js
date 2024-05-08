import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import fetch from 'fetch';
import { transformPhoneNumbers } from 'frontend-organization-portal/utils/transform-phone-numbers';

export default class OrganizationsNewController extends Controller {
  @service router;
  @service store;

  get hasValidationErrors() {
    return (
      this.model.administrativeUnit.error ||
      (this.model.administrativeUnit.isCentralWorshipService &&
        this.model.centralWorshipService.error) ||
      (this.model.administrativeUnit.isWorshipService &&
        this.model.worshipService.error) ||
      this.model.address.error ||
      this.model.contact.error ||
      this.model.secondaryContact.error ||
      this.model.identifierKBO.error ||
      this.model.identifierSharepoint.error
    );
  }

  /**
   * Set the specified property to the given value for each relevant
   * organization model instance in the route.
   * @param {string} property - the name of the property to be set
   * @param {*} value - the value to be assigned to the property
   */
  #setPropertyToValue(property, value) {
    // TODO: loop over relevant models instead of three calls?
    this.model.administrativeUnit[property] = value;
    // TODO: only set when worship user
    this.model.centralWorshipService[property] = value;
    this.model.worshipService[property] = value;
  }

  /**
   * Call a function with the given name and argument on each organization model
   * in this route.
   * @param {string} func - the name of the function to call
   * @param {*} [arg] - optional argument to pass on to the function
   */
  #callFunctionForModels(func, arg) {
    this.model.administrativeUnit[func](arg);
    this.model.centralWorshipService[func](arg);
    this.model.worshipService[func](arg);
  }

  @action
  setRelation(unit) {
    this.#setPropertyToValue(
      'isSubOrganizationOf',
      Array.isArray(unit) ? unit[0] : unit
    );

    if (this.model.administrativeUnit.requiresFoundedByOrganization) {
      this.#setPropertyToValue(
        'wasFoundedByOrganizations',
        Array.isArray(unit) ? unit : unit ? [unit] : []
      );
    }
  }

  @action
  setNames(name) {
    this.#callFunctionForModels('setAbbName', name);
  }

  @action
  setAlternativeNames(names) {
    this.#callFunctionForModels('setAlternativeName', names);
  }

  @action
  setRecognizedWorshipType(type) {
    this.#setPropertyToValue('recognizedWorshipType', type);
  }

  @action
  setOrganizationStatus(status) {
    this.#setPropertyToValue('organizationStatus', status);
  }

  @action
  setIsAssociatedWith(units) {
    this.#setPropertyToValue('isAssociatedWith', units);
  }

  @action
  setHasParticipants(units) {
    this.#setPropertyToValue('hasParticipants', units);
  }

  @action
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }

  @action
  setClassification(value) {
    this.#setPropertyToValue('classification', value);
    this.#callFunctionForModels('resetRelations');
  }

  @dropTask
  *createAdministrativeUnitTask(event) {
    event.preventDefault();

    let {
      administrativeUnit,
      centralWorshipService,
      worshipService,
      primarySite,
      address,
      contact,
      secondaryContact,
      identifierSharepoint,
      identifierKBO,
      structuredIdentifierSharepoint,
      structuredIdentifierKBO,
    } = this.model;

    yield Promise.all([
      administrativeUnit.validate(),
      centralWorshipService.validate(),
      worshipService.validate(),
      address.validate(),
      contact.validate(),
      secondaryContact.validate(),
      identifierKBO.validate(),
      identifierSharepoint.validate(),
    ]);

    if (!this.hasValidationErrors) {
      const siteTypes = yield this.store.findAll('site-type');
      let newAdministrativeUnit;
      // Set the proper type to the new admin unit
      if (administrativeUnit.isCentralWorshipService) {
        newAdministrativeUnit = centralWorshipService;
      } else if (administrativeUnit.isWorshipService) {
        newAdministrativeUnit = worshipService;
      } else {
        newAdministrativeUnit = administrativeUnit;
      }
      copyAdministrativeUnitData(newAdministrativeUnit, administrativeUnit);

      structuredIdentifierKBO = setEmptyStringsToNull(structuredIdentifierKBO);
      yield structuredIdentifierKBO.save();
      yield identifierKBO.save();

      structuredIdentifierSharepoint = setEmptyStringsToNull(
        structuredIdentifierSharepoint
      );
      yield structuredIdentifierSharepoint.save();
      yield identifierSharepoint.save();

      contact = setEmptyStringsToNull(contact);
      contact.telephone = transformPhoneNumbers(contact.telephone);
      yield contact.save();

      secondaryContact = setEmptyStringsToNull(secondaryContact);
      secondaryContact.telephone = transformPhoneNumbers(
        secondaryContact.telephone
      );
      yield secondaryContact.save();

      if (!address.isCountryBelgium) {
        address.province = '';
      }

      address.fullAddress = combineFullAddress(address);
      address = setEmptyStringsToNull(address);
      yield address.save();

      primarySite.address = address;
      (yield primarySite.contacts).push(contact, secondaryContact);
      if (
        administrativeUnit.isAgb ||
        administrativeUnit.isApb ||
        administrativeUnit.isIGS ||
        administrativeUnit.isPoliceZone ||
        administrativeUnit.isAssistanceZone ||
        administrativeUnit.isOcmwAssociation ||
        administrativeUnit.isPevaMunicipality ||
        administrativeUnit.isPevaProvince
      ) {
        primarySite.siteType = siteTypes.find(
          (t) => t.id === 'f1381723dec42c0b6ba6492e41d6f5dd'
        );
      }
      yield primarySite.save();

      (yield newAdministrativeUnit.identifiers).push(
        identifierKBO,
        identifierSharepoint
      );
      newAdministrativeUnit.primarySite = primarySite;

      newAdministrativeUnit = setEmptyStringsToNull(newAdministrativeUnit);

      yield newAdministrativeUnit.save();

      const createRelationshipsEndpoint = `/create-administrative-unit-relationships/${newAdministrativeUnit.id}`;
      yield fetch(createRelationshipsEndpoint, {
        method: 'POST',
      });

      const syncOvoNumberEndpoint = `/sync-ovo-number/${structuredIdentifierKBO.id}`;
      yield fetch(syncOvoNumberEndpoint, {
        method: 'POST',
      });

      this.router.replaceWith(
        'organizations.organization',
        newAdministrativeUnit.id
      );
    }
  }

  reset() {
    this.model.primarySite.rollbackAttributes();
    this.model.identifierSharepoint.reset();
    this.model.identifierKBO.reset();
    this.model.structuredIdentifierSharepoint.rollbackAttributes();
    this.model.structuredIdentifierKBO.rollbackAttributes();
    this.model.administrativeUnit.reset();
    this.model.centralWorshipService.reset();
    this.model.worshipService.reset();
    this.model.contact.reset();
    this.model.secondaryContact.reset();
    this.model.address.reset();
  }
}

function copyAdministrativeUnitData(newAdministrativeUnit, administrativeUnit) {
  newAdministrativeUnit.name = administrativeUnit.name;
  newAdministrativeUnit.legalName = administrativeUnit.legalName;
  newAdministrativeUnit.alternativeName = administrativeUnit.alternativeName;
  newAdministrativeUnit.recognizedWorshipType =
    administrativeUnit.recognizedWorshipType;
  newAdministrativeUnit.classification = administrativeUnit.classification;
  newAdministrativeUnit.organizationStatus =
    administrativeUnit.organizationStatus;
  if (administrativeUnit.wasFoundedByOrganizations?.length) {
    newAdministrativeUnit.wasFoundedByOrganizations =
      administrativeUnit.wasFoundedByOrganizations.slice();
  }
  newAdministrativeUnit.isSubOrganizationOf =
    administrativeUnit.isSubOrganizationOf;
  if (administrativeUnit.subOrganizations?.length) {
    newAdministrativeUnit.subOrganizations =
      administrativeUnit.subOrganizations.slice();
  }
  if (administrativeUnit.foundedOrganizations?.length) {
    newAdministrativeUnit.foundedOrganizations =
      administrativeUnit.foundedOrganizations.slice();
  }
  newAdministrativeUnit.isAssociatedWith = administrativeUnit.isAssociatedWith;
  if (administrativeUnit.scope) {
    newAdministrativeUnit.scope = administrativeUnit.scope;
    if (newAdministrativeUnit.scope.locatedWithin) {
      newAdministrativeUnit.scope.locatedWithin =
        administrativeUnit.scope.locatedWithin;
    }
  }
  if (administrativeUnit.hasParticipants?.length) {
    newAdministrativeUnit.hasParticipants =
      administrativeUnit.hasParticipants.slice();
  }
  if (administrativeUnit.expectedEndDate) {
    newAdministrativeUnit.expectedEndDate = administrativeUnit.expectedEndDate;
  }
  if (administrativeUnit.purpose?.length) {
    newAdministrativeUnit.purpose = administrativeUnit.purpose;
  }
}
