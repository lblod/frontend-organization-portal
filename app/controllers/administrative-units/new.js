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
    yield administrativeUnit.save();

    //wrong...
    if (
      administrativeUnit.classification.get('id') ==
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE
    ) {
      centralWorshipService = administrativeUnit;
      yield centralWorshipService.save();
    } else if (
      administrativeUnit.classification.get('id') ==
      CLASSIFICATION.WORSHIP_SERVICE
    ) {
      worshipService = administrativeUnit;
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
