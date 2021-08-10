import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

const IDNAMES = {
  SHAREPOINT: 'SharePoint identificator',
  KBO: 'KBO nummer',
};

export default class AdministrativeUnitsNewController extends Controller {
  @service router;
  @service store;

  @dropTask
  *createAdministrativeUnitTask(event) {
    event.preventDefault();

    let {
      administrativeUnit,
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
  }
}
