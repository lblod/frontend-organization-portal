import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditController extends Controller {
  @service router;

  @tracked isCurrentPositionCheck;

  setup() {
    this.isCurrentPositionCheck = this.isCurrentPosition;
  }

  get isCurrentPosition() {
    return this.mandatory.endDate !== null;
  }

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

    if (this.governingBody.hasDirtyAttributes) {
      let mandate = yield this.mandatory.mandate;
      mandate.governingBody = this.governingBody;

      yield mandate.save();
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
