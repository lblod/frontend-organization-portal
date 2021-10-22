import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditController extends Controller {
  @service router;

  @dropTask
  *save(event) {
    event.preventDefault();

    let { administrativeUnit, address, contact } = this.model;

    yield administrativeUnit.validate();
    yield address.validate();
    yield contact.validate();

    if (administrativeUnit.isValid && address.isValid && contact.isValid) {
      let primarySite = yield administrativeUnit.primarySite;

      if (address.isDirty) {
        address.fullAddress = combineFullAddress(address);
        yield address.save();
      }

      if (contact.isDirty) {
        let isNewContact = contact.isNew;
        yield contact.save();

        if (isNewContact) {
          yield primarySite.save();
        }
      }

      let identifiers = yield administrativeUnit.identifiers;

      for (let identifier of identifiers.toArray()) {
        let structuredIdentifier = yield identifier.structuredIdentifier;
        if (structuredIdentifier.hasDirtyAttributes) {
          let isNewIdentifier = structuredIdentifier.isNew;

          yield structuredIdentifier.save();

          if (isNewIdentifier) {
            yield identifier.save();
          }
        }
      }

      yield administrativeUnit.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.core-data',
        administrativeUnit.id
      );
    }
  }
}
