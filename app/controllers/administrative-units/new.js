import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { GOVERNING_BODY_CLASSIFICATION } from 'frontend-organization-portal/models/governing-body-classification-code';
import { action } from '@ember/object';

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

  get isNewWorshipService() {
    return (
      this.model.administrativeUnit.classification?.id ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isNewCentralWorshipService() {
    return (
      this.model.administrativeUnit.classification?.id ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  @action
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
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

    let newAdministrativeUnit = this.isNewCentralWorshipService
      ? centralWorshipService
      : worshipService;

    yield Promise.all([
      administrativeUnit.validate(),
      address.validate(),
      contact.validate(),
      secondaryContact.validate(),
      structuredIdentifierKBO.validate(),
    ]);

    if (
      administrativeUnit.isValid &&
      address.isValid &&
      contact.isValid &&
      secondaryContact.isValid &&
      structuredIdentifierKBO.isValid
    ) {
      copyAdministrativeUnitData(newAdministrativeUnit, administrativeUnit);

      yield structuredIdentifierSharepoint.save();
      yield structuredIdentifierKBO.save();

      identifierSharepoint.structuredIdentifier =
        structuredIdentifierSharepoint;
      yield identifierSharepoint.save();

      identifierKBO.structuredIdentifier = structuredIdentifierKBO;
      yield identifierKBO.save();

      yield contact.save();
      yield secondaryContact.save();

      address.fullAddress = combineFullAddress(address);
      yield address.save();

      primarySite.address = address;
      primarySite.contacts.pushObjects([contact, secondaryContact]);
      yield primarySite.save();

      newAdministrativeUnit.identifiers.pushObjects([
        identifierKBO,
        identifierSharepoint,
      ]);
      newAdministrativeUnit.primarySite = primarySite;

      if (newAdministrativeUnit.denomination === '') {
        newAdministrativeUnit.denomination = null;
      }
      yield newAdministrativeUnit.save();

      let governingBody = this.store.createRecord('governing-body');
      governingBody.administrativeUnit = newAdministrativeUnit;
      governingBody.classification = yield this.getGoverningBodyClassification(
        administrativeUnit
      );
      yield governingBody.save();

      let governingBodyTimeSpecialization =
        this.store.createRecord('governing-body');
      governingBodyTimeSpecialization.isTimeSpecializationOf = governingBody;
      yield governingBodyTimeSpecialization.save();

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
    this.model.centralWorshipService.rollbackAttributes();
    this.model.worshipService.rollbackAttributes();
  }

  removeUnsavedChangesetRecords() {
    if (this.model.administrativeUnit.isNew) {
      this.model.administrativeUnit.destroyRecord();
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

  async getGoverningBodyClassification(worshipAdministrativeUnit) {
    let administrativeUnitClassification =
      await worshipAdministrativeUnit.classification;
    let worshipType = await worshipAdministrativeUnit.recognizedWorshipType;

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
  newAdministrativeUnit.subOrganizations = administrativeUnit.subOrganizations;
  newAdministrativeUnit.isAssociatedWith = administrativeUnit.isAssociatedWith;
}
