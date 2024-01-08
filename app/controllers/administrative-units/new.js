import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
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
      this.model.administrativeUnitChangeset.isInvalid ||
      this.model.address.isInvalid ||
      this.model.contact.isInvalid ||
      this.model.secondaryContact.isInvalid ||
      this.model.structuredIdentifierKBO.isInvalid ||
      this.model.structuredIdentifierSharepoint.isInvalid
    );
  }

  get isNewOCMW() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.OCMW
    );
  }

  get isNewAgb() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.AGB
    );
  }
  get isNewApb() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.APB
    );
  }

  get isNewDistrict() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.DISTRICT
    );
  }

  get isNewMunicipality() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get isNewWorshipService() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isNewCentralWorshipService() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get isNewWorshipAdministrativeUnit() {
    return this.isNewWorshipService || this.isNewCentralWorshipService;
  }

  get hasCentralWorshipService() {
    const typesThatHaveACentralWorshipService = [
      RECOGNIZED_WORSHIP_TYPE.ISLAMIC,
      RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC,
      RECOGNIZED_WORSHIP_TYPE.ORTHODOX,
    ];

    return (
      this.isNewWorshipService &&
      typesThatHaveACentralWorshipService.find(
        (id) =>
          id == this.model.administrativeUnitChangeset.recognizedWorshipType?.id
      )
    );
  }

  get isNewIGS() {
    const typesThatAreIGS = [
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ];

    return typesThatAreIGS.find(
      (id) => id == this.model.administrativeUnitChangeset.classification?.id
    );
  }

  get isNewPoliceZone() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.POLICE_ZONE
    );
  }

  get isNewAssistanceZone() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.ASSISTANCE_ZONE
    );
  }

  get isNewOcmwAssociation() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.includes(
      this.model.administrativeUnitChangeset.classification?.get('id')
    );
  }

  get isNewPevaMunicipality() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.PEVA_MUNICIPALITY
    );
  }

  get isNewPevaProvince() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.PEVA_PROVINCE
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
      // TODO: confirm PEVA municipality are valid participants
      CLASSIFICATION_CODE.PEVA_MUNICIPALITY,
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

  @action
  setRelation(unit) {
    if (Array.isArray(unit)) {
      this.model.administrativeUnitChangeset.isSubOrganizationOf = unit[0];
    } else {
      this.model.administrativeUnitChangeset.isSubOrganizationOf = unit;
    }

    if (
      this.isNewAgb ||
      this.isNewApb ||
      this.isNewOcmwAssociation ||
      this.isNewPevaMunicipalitt ||
      this.isNewPevaProvince
    )
      if (Array.isArray(unit)) {
        this.model.administrativeUnitChangeset.wasFoundedByOrganizations = unit;
      } else {
        this.model.administrativeUnitChangeset.wasFoundedByOrganizations =
          new Array(unit);
      }
  }

  @action
  setHasParticipants(units) {
    this.model.administrativeUnitChangeset.hasParticipants = units;
  }

  @action
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }

  @action
  setClassification(value) {
    this.model.administrativeUnitChangeset.classification = value;
    this.model.administrativeUnitChangeset.subOrganizations = [];
    this.model.administrativeUnitChangeset.foundedOrganizations = [];
    this.model.administrativeUnitChangeset.isAssociatedWith = [];
    this.model.administrativeUnitChangeset.isSubOrganizationOf = null;
    this.model.administrativeUnitChangeset.wasFoundedByOrganizations = [];
    this.model.administrativeUnitChangeset.hasParticipants = [];
  }

  @dropTask
  *createAdministrativeUnitTask(event) {
    event.preventDefault();

    let {
      administrativeUnitChangeset,
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
      administrativeUnitChangeset.validate(),
      address.validate(),
      contact.validate(),
      secondaryContact.validate(),
      structuredIdentifierKBO.validate(),
      structuredIdentifierSharepoint.validate(),
    ]);

    if (!this.hasValidationErrors) {
      const siteTypes = yield this.store.findAll('site-type');
      let newAdministrativeUnit;
      // Set the proper type to the new admin unit
      if (this.isNewCentralWorshipService) {
        newAdministrativeUnit = centralWorshipService;
      } else if (this.isNewWorshipService) {
        newAdministrativeUnit = worshipService;
      } else {
        newAdministrativeUnit = administrativeUnit;
      }
      // Copy data entered in the frontend to the new admin unit
      copyAdministrativeUnitData(
        newAdministrativeUnit,
        administrativeUnitChangeset
      );

      structuredIdentifierKBO = setEmptyStringsToNull(structuredIdentifierKBO);
      identifierKBO.structuredIdentifier = structuredIdentifierKBO;
      yield structuredIdentifierKBO.save();
      yield identifierKBO.save();

      structuredIdentifierSharepoint = setEmptyStringsToNull(
        structuredIdentifierSharepoint
      );
      identifierSharepoint.structuredIdentifier =
        structuredIdentifierSharepoint;
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

      if (address.country != 'België') {
        address.province = '';
      }

      address.fullAddress = combineFullAddress(address);
      address = setEmptyStringsToNull(address);
      yield address.save();

      primarySite.address = address;
      primarySite.contacts.pushObjects([contact, secondaryContact]);
      if (
        this.isNewAgb ||
        this.isNewApb ||
        this.isNewIGS ||
        this.isNewPoliceZone ||
        this.isNewAssistanceZone ||
        this.isNewOcmwAssociation ||
        this.isNewPevaMunicipality ||
        this.isNewPevaProvince
      ) {
        primarySite.siteType = siteTypes.find(
          (t) => t.id === 'f1381723dec42c0b6ba6492e41d6f5dd'
        );
      }
      yield primarySite.save();

      newAdministrativeUnit.identifiers.pushObjects([
        identifierKBO,
        identifierSharepoint,
      ]);
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
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.removeUnsavedChangesetRecords();
    this.model.primarySite.rollbackAttributes();
    this.model.identifierSharepoint.rollbackAttributes();
    this.model.identifierKBO.rollbackAttributes();
    this.model.structuredIdentifierSharepoint.rollbackAttributes();
    this.model.structuredIdentifierKBO.rollbackAttributes();
    this.model.administrativeUnitChangeset.rollbackAttributes();
  }

  removeUnsavedChangesetRecords() {
    if (this.model.administrativeUnitChangeset.isNew) {
      this.model.administrativeUnitChangeset.destroyRecord();
    }

    if (this.model.address.isNew) {
      this.model.address.destroyRecord();
    }

    if (this.model.contact.isNew) {
      this.model.contact.destroyRecord();
    }

    if (this.model.secondaryContact.isNew) {
      this.model.secondaryContact.destroyRecord();
    }

    if (this.model.structuredIdentifierKBO.isNew) {
      this.model.structuredIdentifierKBO.destroyRecord();
    }
  }
}

function copyAdministrativeUnitData(newAdministrativeUnit, administrativeUnit) {
  newAdministrativeUnit.name = administrativeUnit.name;
  newAdministrativeUnit.expectedEndDate = administrativeUnit.expectedEndDate;
  newAdministrativeUnit.recognizedWorshipType =
    administrativeUnit.recognizedWorshipType;
  newAdministrativeUnit.classification = administrativeUnit.classification;
  newAdministrativeUnit.organizationStatus =
    administrativeUnit.organizationStatus;
  newAdministrativeUnit.wasFoundedByOrganizations =
    administrativeUnit.wasFoundedByOrganizations;
  newAdministrativeUnit.isSubOrganizationOf =
    administrativeUnit.isSubOrganizationOf;
  if (
    administrativeUnit.subOrganizations &&
    administrativeUnit.subOrganizations.length
  ) {
    newAdministrativeUnit.subOrganizations =
      administrativeUnit.subOrganizations;
  }
  if (
    administrativeUnit.foundedOrganizations &&
    administrativeUnit.foundedOrganizations.length
  ) {
    newAdministrativeUnit.foundedOrganizations =
      administrativeUnit.foundedOrganizations;
  }
  newAdministrativeUnit.isAssociatedWith = administrativeUnit.isAssociatedWith;
  if (administrativeUnit.scope) {
    newAdministrativeUnit.scope = administrativeUnit.scope;
    if (newAdministrativeUnit.scope.locatedWithin) {
      newAdministrativeUnit.scope.locatedWithin =
        administrativeUnit.scope.locatedWithin;
    }
  }
  if (
    administrativeUnit.hasParticipants &&
    administrativeUnit.hasParticipants.length
  ) {
    newAdministrativeUnit.hasParticipants = administrativeUnit.hasParticipants;
  }
  if (administrativeUnit.expectedEndDate) {
    newAdministrativeUnit.expectedEndDate = administrativeUnit.expectedEndDate;
  }
  if (administrativeUnit.purpose?.length) {
    newAdministrativeUnit.purpose = administrativeUnit.purpose;
  }
}
