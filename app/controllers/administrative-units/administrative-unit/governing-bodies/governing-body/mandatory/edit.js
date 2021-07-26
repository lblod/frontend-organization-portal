import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditController extends Controller {
  @service router;

  get mandatory() {
    return this.model.mandatory;
  }

  get administrativeUnit() {
    return this.model.administrativeUnit;
  }

  get governingBody() {
    return this.model.govBodyTemp;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let contacts = yield this.mandatory.contacts;
    if (contacts.firstObject.hasDirtyAttributes) {
      let address = yield contacts.firstObject.contactAddress;

      if (address.hasDirtyAttributes) {
        address.fullAddress = combineFullAddress(address);
        yield address.save();
      }
      let isNewContact = contacts.firstObject.isNew;
      yield contacts.firstObject.save();

      if (isNewContact) {
        yield this.mandatory.save();
      }
    }

    yield this.mandatory.save();

    yield this.governingBody.save();

    yield this.administrativeUnit.save();

    this.router.transitionTo(
      'administrative-units.administrative-unit.governing-bodies.governing-body',
      this.governingBody.id
    );
  }
}
