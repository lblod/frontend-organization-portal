import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditController extends Controller {
  @service router;

  get administrativeUnit() {
    return this.model.administrativeUnit;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    // TODO: Handle API errors
    let primarySite = yield this.administrativeUnit.primarySite;

    let address = yield primarySite.address;
    if (address.hasDirtyAttributes) {
      let fullStreet = `${address.street || ''} ${address.number || ''} ${
        address.boxNumber || ''
      }`.trim();

      let muncipalityInformation = `${address.postcode || ''} ${
        address.municipality || ''
      }`.trim();

      if (fullStreet && muncipalityInformation) {
        address.fullAddress = `${fullStreet}, ${muncipalityInformation}`;
      } else if (fullStreet) {
        address.fullAddress = fullStreet;
      } else {
        address.fullAddress = muncipalityInformation;
      }

      yield address.save();
    }

    let contacts = yield primarySite.contacts;
    if (contacts.firstObject.hasDirtyAttributes) {
      let isNewContact = contacts.firstObject.isNew;
      yield contacts.firstObject.save();

      if (isNewContact) {
        yield primarySite.save();
      }
    }

    let identifiers = yield this.administrativeUnit.identifiers;

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

    yield this.administrativeUnit.save();

    this.router.transitionTo(
      'administrative-units.administrative-unit.core-data',
      this.administrativeUnit.id
    );
  }
}
