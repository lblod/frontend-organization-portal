import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import WorshipServiceModel from 'frontend-organization-portal/models/worship-service';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditController extends Controller {
  @service router;

  get isWorshipService() {
    return this.model.administrativeUnit instanceof WorshipServiceModel;
  }

  @action
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }

  @dropTask
  *save(event) {
    event.preventDefault();
    let {
      administrativeUnit,
      address,
      contact,
      secondaryContact,
      identifierKBO,
      identifierSharepoint,
      structuredIdentifierKBO,
      structuredIdentifierSharepoint,
    } = this.model;

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
      let primarySite = yield administrativeUnit.primarySite;

      // TODO : "if" not needed when the data of all administrative units will be correct
      // they should all have a primary site on creation
      if (!primarySite) {
        primarySite = primarySite = this.store.createRecord('site');
        primarySite.address = address;
        administrativeUnit.primarySite = primarySite;
      }

      if (address.isDirty) {
        address.fullAddress = combineFullAddress(address);
        yield address.save();
      }

      let siteContacts = yield primarySite.contacts;

      if (contact.isDirty) {
        let isNewContact = contact.isNew;
        yield contact.save();

        if (isNewContact) {
          siteContacts.pushObject(contact);
          yield primarySite.save();
        }
      }

      if (secondaryContact.isDirty) {
        let isNewContact = secondaryContact.isNew;
        yield secondaryContact.save();

        if (isNewContact) {
          siteContacts.pushObject(secondaryContact);
          yield primarySite.save();
        }
      }

      yield structuredIdentifierKBO.save();
      yield identifierKBO.save();

      yield structuredIdentifierSharepoint.save();
      yield identifierSharepoint.save();

      yield administrativeUnit.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.core-data',
        administrativeUnit.id
      );
    }
  }
}
