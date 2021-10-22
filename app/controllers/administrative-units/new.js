import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

const CLASSIFICATION = {
  CENTRAL_WORSHIP_SERVICE: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
  WORSHIP_SERVICE: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
};

export default class AdministrativeUnitsNewController extends Controller {
  @service router;
  @service store;

  get isNewWorshipService() {
    return (
      this.model.administrativeUnit.classification?.id ===
      CLASSIFICATION.WORSHIP_SERVICE
    );
  }

  get isNewCentralWorshipService() {
    return (
      this.model.administrativeUnit.classification?.id ===
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE
    );
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
      identifierSharepoint,
      identifierKBO,
      structuredIdentifierSharepoint,
      structuredIdentifierKBO,
    } = this.model;

    let newAdministrativeUnit = this.isNewCentralWorshipService
      ? centralWorshipService
      : worshipService;

    yield administrativeUnit.validate();
    yield address.validate();
    yield contact.validate();

    if (administrativeUnit.isValid && address.isValid && contact.isValid) {
      copyAdministrativeUnitData(newAdministrativeUnit, administrativeUnit);

      yield structuredIdentifierSharepoint.save();
      yield structuredIdentifierKBO.save();

      identifierSharepoint.structuredIdentifier =
        structuredIdentifierSharepoint;
      yield identifierSharepoint.save();

      identifierKBO.structuredIdentifier = structuredIdentifierKBO;
      yield identifierKBO.save();

      yield contact.save();

      address.fullAddress = combineFullAddress(address);
      yield address.save();

      primarySite.address = address;
      primarySite.contacts.pushObject(contact);
      yield primarySite.save();

      newAdministrativeUnit.identifiers.pushObjects([
        identifierKBO,
        identifierSharepoint,
      ]);
      newAdministrativeUnit.primarySite = primarySite;

      yield newAdministrativeUnit.save();

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
  }
}

function copyAdministrativeUnitData(newAdministrativeUnit, administrativeUnit) {
  newAdministrativeUnit.name = administrativeUnit.name;
  newAdministrativeUnit.recognizedWorshipType =
    administrativeUnit.recognizedWorshipType;
  newAdministrativeUnit.classification = administrativeUnit.classification;
  newAdministrativeUnit.organizationStatus =
    administrativeUnit.organizationStatus;
  newAdministrativeUnit.scope = administrativeUnit.scope;
  newAdministrativeUnit.isSubOrganizationOf =
    administrativeUnit.isSubOrganizationOf;
  newAdministrativeUnit.subOrganizations = administrativeUnit.subOrganizations;
  newAdministrativeUnit.isAssociatedWith = administrativeUnit.isAssociatedWith;
}
