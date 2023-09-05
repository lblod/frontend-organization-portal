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
      // TODO when onboarded, add politiezone, hulpverleningzone and companies
    ];
  }

  @action
  setRelation(unit) {
    this.model.administrativeUnitChangeset.isSubOrganizationOf = unit;
    if (this.isNewAgb || this.isNewApb)
      this.model.administrativeUnitChangeset.wasFoundedByOrganization = unit;
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
    this.model.administrativeUnitChangeset.wasFoundedByOrganization = null;
    this.model.administrativeUnitChangeset.hasParticipants = [];
  }

  @dropTask
  *createAdministrativeUnitTask(event) {
    event.preventDefault();
    console.log('creating')
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
      console.log(newAdministrativeUnit)
      console.log('copying')
      // Copy data entered in the frontend to the new admin unit
      copyAdministrativeUnitData(
        newAdministrativeUnit,
        administrativeUnitChangeset
      );

      console.log(newAdministrativeUnit)
      
      console.log(structuredIdentifierKBO)
      structuredIdentifierKBO = setEmptyStringsToNull(structuredIdentifierKBO);
      console.log(structuredIdentifierKBO)
      console.log('before')
      yield structuredIdentifierKBO.save();
      console.log('save')
      identifierKBO.structuredIdentifier = structuredIdentifierKBO;
      console.log('structured')
      console.log(structuredIdentifierKBO)
      
      console.log('identifier')
      console.log(identifierKBO)
      yield identifierKBO.save();

     
      structuredIdentifierSharepoint = setEmptyStringsToNull(
        structuredIdentifierSharepoint
      );
      identifierSharepoint.structuredIdentifier =
        structuredIdentifierSharepoint;
        console.log(structuredIdentifierSharepoint);
      yield structuredIdentifierSharepoint.save();
      console.log(identifierSharepoint);
      yield identifierSharepoint.save();

      console.log(contact)
      contact = setEmptyStringsToNull(contact);
      yield contact.save();

      console.log(secondaryContact)
      secondaryContact = setEmptyStringsToNull(secondaryContact);
      yield secondaryContact.save();

      if (address.country != 'België') {
        address.province = '';
      }

      address.fullAddress = combineFullAddress(address);
      console.log(address)
      address = setEmptyStringsToNull(address);
      yield address.save();

      primarySite.address = address;
      primarySite.contacts.pushObjects([contact, secondaryContact]);
      if (this.isNewAgb || this.isNewApb || this.isNewIGS) {
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

      console.log(newAdministrativeUnit)
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
      console.log(this.model.administrativeUnitChangeset)
      this.model.administrativeUnitChangeset.destroyRecord();
    }

    if (this.model.address.isNew) {
      console.log(this.model.address)
      this.model.address.destroyRecord();
    }

    if (this.model.contact.isNew) {
      console.log(this.model.contact)
      this.model.contact.destroyRecord();
    }

    if (this.model.secondaryContact.isNew) {
      console.log(this.model.secondaryContact)
      this.model.secondaryContact.destroyRecord();
    }

    if (this.model.structuredIdentifierKBO.isNew) {
      console.log(this.model.structuredIdentifierKBO)
      this.model.structuredIdentifierKBO.destroyRecord();
    }
  }
}

function copyAdministrativeUnitData(newAdministrativeUnit, administrativeUnit) {
  console.log(newAdministrativeUnit);
  console.log(administrativeUnit)
  newAdministrativeUnit.name = administrativeUnit.name;
  newAdministrativeUnit.recognizedWorshipType =
    administrativeUnit.recognizedWorshipType;
  console.log(1)
  newAdministrativeUnit.classification = administrativeUnit.classification;
  newAdministrativeUnit.organizationStatus =
    administrativeUnit.organizationStatus;
  newAdministrativeUnit.wasFoundedByOrganization =
    administrativeUnit.wasFoundedByOrganization;
  newAdministrativeUnit.isSubOrganizationOf =
    administrativeUnit.isSubOrganizationOf;
    console.log(2)
  if (
    administrativeUnit.subOrganizations &&
    administrativeUnit.subOrganizations.length
  ) {
    newAdministrativeUnit.subOrganizations =
      administrativeUnit.subOrganizations;
      
  }
  console.log(3)
  if (
    administrativeUnit.foundedOrganizations &&
    administrativeUnit.foundedOrganizations.length
  ) {
    newAdministrativeUnit.foundedOrganizations =
      administrativeUnit.foundedOrganizations;
      
  }
  console.log(4)
  if(administrativeUnit.isAssociatedWith && administrativeUnit.isAssociatedWith.length) {
    newAdministrativeUnit.isAssociatedWith = administrativeUnit.isAssociatedWith;
  }
  console.log(4.1)
  if (administrativeUnit.scope) {
    console.log(4.2)
    newAdministrativeUnit.scope = administrativeUnit.scope;
    console.log(4.3)
    if (newAdministrativeUnit.scope.locatedWithin) {
      console.log(4.4)
      newAdministrativeUnit.scope.locatedWithin =
        administrativeUnit.scope.locatedWithin;
        console.log(4.5)
    }
  }
  console.log(5)
  if (
    administrativeUnit.hasParticipants &&
    administrativeUnit.hasParticipants.length
  ) {
    console.log('enters')
    newAdministrativeUnit.hasParticipants = administrativeUnit.hasParticipants;
    console.log('finishes')
  }
  console.log('finished copying')
}
