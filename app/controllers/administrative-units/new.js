import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import fetch from 'fetch';
import { transformPhoneNumbers } from '../../utils/transform-phone-numbers';

export default class AdministrativeUnitsNewController extends Controller {
  @service router;
  @service store;

  get hasValidationErrors() {
    return (
      this.model.administrativeUnit.error ||
      this.model.address.error ||
      this.model.contact.error ||
      this.model.secondaryContact.error ||
      this.model.identifierKBO.error ||
      this.model.identifierSharepoint.error
    );
  }

  get classificationCodes() {
    return [CLASSIFICATION_CODE.MUNICIPALITY];
  }

  get classificationCodesIgsParticipants() {
    return [
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
      CLASSIFICATION_CODE.AGB,
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION_CODE.POLICE_ZONE,
      CLASSIFICATION_CODE.ASSISTANCE_ZONE,
      CLASSIFICATION_CODE.PEVA_MUNICIPALITY,
      CLASSIFICATION_CODE.PEVA_PROVINCE,
      // TODO when onboarded, add companies
    ];
  }

  get classificationCodesOcmwAssociationFounders() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.concat([
      CLASSIFICATION_CODE.OCMW,
      CLASSIFICATION_CODE.MUNICIPALITY,
    ]);
  }

  get classificationCodesOcmwAssociationParticipants() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.concat([
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
    ]);
  }

  get classificationCodesPevaParticipants() {
    return [
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ];
  }

  @action
  setRelation(unit) {
    this.model.administrativeUnit.isSubOrganizationOf = Array.isArray(unit)
      ? unit[0]
      : unit;

    if (
      this.model.administrativeUnit.isAgb ||
      this.model.administrativeUnit.isApb ||
      this.model.administrativeUnit.isOcmwAssociation ||
      this.model.administrativeUnit.isPevaMunicipality ||
      this.model.administrativeUnit.isPevaProvince
    ) {
      this.model.administrativeUnit.wasFoundedByOrganizations = Array.isArray(
        unit
      )
        ? unit
        : unit
        ? [unit]
        : [];
    }
  }

  @action
  setNames(name) {
    this.model.administrativeUnit.setAbbName(name);
  }

  @action
  setAlternativeNames(names) {
    this.model.administrativeUnit.setAlternativeName(names);
  }

  @action
  setHasParticipants(units) {
    this.model.administrativeUnit.hasParticipants = units;
  }

  @action
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }

  @action
  setClassification(value) {
    this.model.administrativeUnit.classification = value;
    this.model.administrativeUnit.subOrganizations = [];
    this.model.administrativeUnit.foundedOrganizations = [];
    this.model.administrativeUnit.isAssociatedWith = null;
    this.model.administrativeUnit.isSubOrganizationOf = null;
    this.model.administrativeUnit.wasFoundedByOrganizations = [];
    this.model.administrativeUnit.hasParticipants = [];
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
        'administrative-units.administrative-unit',
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
