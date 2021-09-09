import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditController extends Controller {
  @service router;

  @tracked isCurrentPosition;

  setup() {
    this.isCurrentPosition = !this.mandatory.endDate;
  }

  @action
  handleIsCurrentPositionChange() {
    this.isCurrentPosition = !this.isCurrentPosition;
    if (this.isCurrentPosition) {
      this.mandatory.endDate = undefined;
    }
  }

  get mandatory() {
    return this.model.mandatory;
  }

  get administrativeUnit() {
    return this.model.administrativeUnit;
  }

  get governingBody() {
    return this.model.governingBody;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let contacts = yield this.mandatory.contacts;
    let address = yield contacts.firstObject.contactAddress;

    if (address.isNew || address.hasDirtyAttributes) {
      address.fullAddress = combineFullAddress(address);
      yield address.save();
    }

    yield contacts.firstObject.save();

    yield this.mandatory.save();

    this.router.transitionTo(
      'administrative-units.administrative-unit.governing-bodies.governing-body',
      this.governingBody.id
    );
  }
}
