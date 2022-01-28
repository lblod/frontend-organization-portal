import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditController extends Controller {
  @service router;

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
