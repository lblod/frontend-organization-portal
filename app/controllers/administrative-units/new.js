import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

const IDNAMES = {
  SHAREPOINT: 'SharePoint identificator',
  KBO: 'KBO nummer',
};

const CLASSIFICATION = {
  CENTRAL_WORSHIP_SERVICE: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
  WORSHIP_SERVICE: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
};

export default class AdministrativeUnitsNewController extends Controller {
  @service router;
  @service store;

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

    yield structuredIdentifierSharepoint.save();
    yield structuredIdentifierKBO.save();

    identifierSharepoint.structuredIdentifier = structuredIdentifierSharepoint;
    identifierSharepoint.idName = IDNAMES.SHAREPOINT;
    yield identifierSharepoint.save();

    identifierKBO.structuredIdentifier = structuredIdentifierKBO;
    identifierKBO.idName = IDNAMES.KBO;
    yield identifierKBO.save();

    yield contact.save();

    address.fullAddress = combineFullAddress(address);
    yield address.save();

    primarySite.address = address;
    primarySite.contacts.pushObjects([contact]);
    yield primarySite.save();

    administrativeUnit.identifiers.pushObjects([
      identifierKBO,
      identifierSharepoint,
    ]);
    administrativeUnit.primarySite = primarySite;

    if (
      administrativeUnit.classification.get('id') ==
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE
    ) {
      centralWorshipService.name = administrativeUnit.name;
      centralWorshipService.recognizedWorshipType =
        administrativeUnit.recognizedWorshipType;
      centralWorshipService.classification = administrativeUnit.classification;
      centralWorshipService.organizationStatus =
        administrativeUnit.organizationStatus;
      centralWorshipService.scope = administrativeUnit.scope;
      centralWorshipService.isSubOrganizationOf =
        administrativeUnit.isSubOrganizationOf;
      centralWorshipService.isAssociatedWith =
        administrativeUnit.isAssociatedWith;
      centralWorshipService.identifiers = administrativeUnit.identifiers;
      centralWorshipService.primarySite = administrativeUnit.primarySite;

      yield centralWorshipService.save();
    } else if (
      administrativeUnit.classification.get('id') ==
      CLASSIFICATION.WORSHIP_SERVICE
    ) {
      worshipService.name = administrativeUnit.name;
      worshipService.recognizedWorshipType =
        administrativeUnit.recognizedWorshipType;
      worshipService.classification = administrativeUnit.classification;
      worshipService.organizationStatus = administrativeUnit.organizationStatus;
      worshipService.scope = administrativeUnit.scope;
      worshipService.isSubOrganizationOf =
        administrativeUnit.isSubOrganizationOf;
      worshipService.isAssociatedWith = administrativeUnit.isAssociatedWith;
      worshipService.identifiers = administrativeUnit.identifiers;
      worshipService.primarySite = administrativeUnit.primarySite;

      yield worshipService.save();
    }

    this.router.transitionTo('administrative-units');
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
    if (this.model.centralWorshipService)
      this.model.centralWorshipService.rollbackAttributes();
    if (this.model.worshipService)
      this.model.worshipService.rollbackAttributes();
  }
}
