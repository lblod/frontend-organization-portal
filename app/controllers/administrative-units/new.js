import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import { GOVERNING_BODY_CLASSIFICATION } from 'frontend-organization-portal/models/governing-body-classification-code';

const GOVERNING_BODY_CLASSIFICATION_MAP = {
  [CLASSIFICATION_CODE.WORSHIP_SERVICE]: {
    [RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC]:
      GOVERNING_BODY_CLASSIFICATION.CHURCH_COUNCIL,
    [RECOGNIZED_WORSHIP_TYPE.ANGLICAN]:
      GOVERNING_BODY_CLASSIFICATION.CHURCH_COUNCIL,
    [RECOGNIZED_WORSHIP_TYPE.ISRAELITE]:
      GOVERNING_BODY_CLASSIFICATION.BOARD_OF_DIRECTORS,
    [RECOGNIZED_WORSHIP_TYPE.ISLAMIC]: GOVERNING_BODY_CLASSIFICATION.COMMITTEE,
    [RECOGNIZED_WORSHIP_TYPE.ORTHODOX]:
      GOVERNING_BODY_CLASSIFICATION.CHURCH_FACTORY_COUNCIL,
    [RECOGNIZED_WORSHIP_TYPE.PROTESTANT]:
      GOVERNING_BODY_CLASSIFICATION.BOARD_OF_DIRECTORS,
  },
  [CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE]: {
    [RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC]:
      GOVERNING_BODY_CLASSIFICATION.CENTRAL_CHURCH_BOARD,
    [RECOGNIZED_WORSHIP_TYPE.ANGLICAN]:
      GOVERNING_BODY_CLASSIFICATION.CENTRAL_CHURCH_BOARD,
    [RECOGNIZED_WORSHIP_TYPE.ISRAELITE]:
      GOVERNING_BODY_CLASSIFICATION.CENTRAL_ADMINISTRATION,
    [RECOGNIZED_WORSHIP_TYPE.ISLAMIC]:
      GOVERNING_BODY_CLASSIFICATION.CENTRAL_ADMINISTRATION,
    [RECOGNIZED_WORSHIP_TYPE.ORTHODOX]:
      GOVERNING_BODY_CLASSIFICATION.CENTRAL_CHURCH_BOARD,
    [RECOGNIZED_WORSHIP_TYPE.PROTESTANT]:
      GOVERNING_BODY_CLASSIFICATION.CENTRAL_CHURCH_BOARD,
  },
};

export default class AdministrativeUnitsNewController extends Controller {
  @service router;
  @service store;

  get isNewOCMW() {
    return (
      this.model.administrativeUnitChangeset.classification?.id ===
      CLASSIFICATION_CODE.OCMW
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
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }

  @action
  setClassification(value) {
    this.model.administrativeUnitChangeset.classification = value;
    this.model.administrativeUnitChangeset.subOrganizations = [];
    this.model.administrativeUnitChangeset.isAssociatedWith = [];
    this.model.administrativeUnitChangeset.isSubOrganizationOf = null;
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

      address.fullAddress = combineFullAddress(address);
      address = setEmptyStringsToNull(address);
      yield address.save();

      primarySite.address = address;
      primarySite.contacts.pushObjects([contact, secondaryContact]);
      yield primarySite.save();

      newAdministrativeUnit.identifiers.pushObjects([
        identifierKBO,
        identifierSharepoint,
      ]);
      newAdministrativeUnit.primarySite = primarySite;

      newAdministrativeUnit = setEmptyStringsToNull(newAdministrativeUnit);

      yield newAdministrativeUnit.save();

      const administrativeUnitClassification =
        yield newAdministrativeUnit.classification;

      let governingBodyClassifications;
      if (this.isNewWorshipAdministrativeUnit) {
        governingBodyClassifications = [
          yield this.getGoverningBodyClassification(newAdministrativeUnit),
        ];
      } else {
        governingBodyClassifications = yield this.store.query(
          'governing-body-classification-code',
          {
            filter: {
              'applies-within': {
                ':id:': administrativeUnitClassification.id,
              },
            },
          }
        );
        governingBodyClassifications = governingBodyClassifications.toArray();
      }

      for (let classification of governingBodyClassifications) {
        let governingBody = this.store.createRecord('governing-body');
        governingBody.administrativeUnit = newAdministrativeUnit;
        governingBody.classification = classification;
        yield governingBody.save();

        let governingBodyTimeSpecialization =
          this.store.createRecord('governing-body');
        governingBodyTimeSpecialization.isTimeSpecializationOf = governingBody;
        yield governingBodyTimeSpecialization.save();
      }

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

  async getGoverningBodyClassification(administrativeUnit) {
    let administrativeUnitClassification =
      await administrativeUnit.classification;
    let worshipType = await administrativeUnit.recognizedWorshipType;

    let governingBodyClassificationId =
      GOVERNING_BODY_CLASSIFICATION_MAP[administrativeUnitClassification.id][
        worshipType.id
      ];

    let governingBodyClassification = await this.store.findRecord(
      'governing-body-classification-code',
      governingBodyClassificationId
    );

    return governingBodyClassification;
  }
}

function copyAdministrativeUnitData(newAdministrativeUnit, administrativeUnit) {
  newAdministrativeUnit.name = administrativeUnit.name;
  newAdministrativeUnit.recognizedWorshipType =
    administrativeUnit.recognizedWorshipType;
  newAdministrativeUnit.classification = administrativeUnit.classification;
  newAdministrativeUnit.organizationStatus =
    administrativeUnit.organizationStatus;
  newAdministrativeUnit.isSubOrganizationOf =
    administrativeUnit.isSubOrganizationOf;
  if (
    administrativeUnit.subOrganizations &&
    administrativeUnit.subOrganizations.length
  ) {
    newAdministrativeUnit.subOrganizations =
      administrativeUnit.subOrganizations;
  }
  newAdministrativeUnit.isAssociatedWith = administrativeUnit.isAssociatedWith;
  newAdministrativeUnit.scope.locatedWithin =
    administrativeUnit.scope.locatedWithin;
}
