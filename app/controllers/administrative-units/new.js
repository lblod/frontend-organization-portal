import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import fetch from 'fetch';

export default class AdministrativeUnitsNewController extends Controller {
  @service router;
  @service store;

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

  get classificationCodes() {
    return [CLASSIFICATION_CODE.MUNICIPALITY];
  }

  @action
  setRelation(unit) {
    this.model.administrativeUnitChangeset.isSubOrganizationOf = unit;
    if (this.isNewAgb || this.isNewApb)
      this.model.administrativeUnitChangeset.wasFoundedByOrganization = unit;
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
    this.model.administrativeUnitChangeset.wasFoundedByOrganization = null;
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
    ]);

    if (
      administrativeUnitChangeset.isValid &&
      address.isValid &&
      contact.isValid &&
      secondaryContact.isValid &&
      structuredIdentifierKBO.isValid
    ) {
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
      yield contact.save();

      secondaryContact = setEmptyStringsToNull(secondaryContact);
      yield secondaryContact.save();

      if (address.country != 'België') {
        address.province = '';
      }

      address.fullAddress = combineFullAddress(address);
      address = setEmptyStringsToNull(address);
      yield address.save();

      primarySite.address = address;
      primarySite.contacts.pushObjects([contact, secondaryContact]);
      if (this.isNewAgb || this.isNewApb) {
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
  newAdministrativeUnit.recognizedWorshipType =
    administrativeUnit.recognizedWorshipType;
  newAdministrativeUnit.classification = administrativeUnit.classification;
  newAdministrativeUnit.organizationStatus =
    administrativeUnit.organizationStatus;
  newAdministrativeUnit.wasFoundedByOrganization =
    administrativeUnit.wasFoundedByOrganization;
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
}
