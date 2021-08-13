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
      this.model.administrativeUnit.classification.get('id') ===
      CLASSIFICATION.WORSHIP_SERVICE
    );
  }

  get isNewCentralWorshipService() {
    return (
      this.model.administrativeUnit.classification.get('id') ===
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

    copyAdministrativeUnitData(newAdministrativeUnit, administrativeUnit);

    yield structuredIdentifierSharepoint.save();
    yield structuredIdentifierKBO.save();

    identifierSharepoint.structuredIdentifier = structuredIdentifierSharepoint;
    yield identifierSharepoint.save();

    identifierKBO.structuredIdentifier = structuredIdentifierKBO;
    yield identifierKBO.save();

    yield contact.save();

    address.fullAddress = combineFullAddress(address);
    yield address.save();

    primarySite.address = address;
    primarySite.contacts.pushObjects([contact]);
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

  reset() {
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.administrativeUnit.rollbackAttributes();
    this.model.primarySite.rollbackAttributes();
    this.model.address.rollbackAttributes();
    this.model.contact.rollbackAttributes();
    this.model.identifierSharepoint.rollbackAttributes();
    this.model.identifierKBO.rollbackAttributes();
    this.model.structuredIdentifierSharepoint.rollbackAttributes();
    this.model.structuredIdentifierKBO.rollbackAttributes();
    this.model.centralWorshipService.rollbackAttributes();
    this.model.worshipService.rollbackAttributes();
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
  newAdministrativeUnit.isAssociatedWith = administrativeUnit.isAssociatedWith;
}
