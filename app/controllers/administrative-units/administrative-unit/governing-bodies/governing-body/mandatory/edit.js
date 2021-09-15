import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contact-hub/models/address';
import { BOARD_POSITION } from 'frontend-contact-hub/models/board-position';

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
    return this.model.governingBody;
  }

  get showHalfElectionTypeSelect() {
    return this.model.roleBoard.id === BOARD_POSITION.WORSHIP_MEMBER;
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
