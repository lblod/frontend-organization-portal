import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';

const FINANCING_CODE = {
  SELF_FINANCED: '997073905f839ac6bafe92b76050ab0b',
  FOD_FINANCED: '9d6f49b3d923b437ec3a91e8b5fa6885',
};

export default class AdministrativeUnitsAdministrativeUnitMinistersNewController extends Controller {
  @service router;
  @service store;

  queryParams = ['personId', 'positionId'];

  @tracked personId;
  @tracked positionId;
  @tracked targetPerson = null;
  @tracked willReceiveFinancing = true;

  get isSelectingTargetPerson() {
    return !this.targetPerson;
  }

  @action
  handleEndDateChange(endDate) {
    let { minister } = this.model;
    minister.agentEndDate = endDate;

    if (!endDate) {
      minister.isCurrentPosition = true;
    } else {
      minister.isCurrentPosition = false;
    }
  }

  @action
  handleIsCurrentPositionChange() {
    let { minister } = this.model;
    let isCurrentPosition = minister.isCurrentPosition;

    if (!isCurrentPosition) {
      minister.agentEndDate = undefined;
    }

    minister.isCurrentPosition = !isCurrentPosition;
  }

  @dropTask
  *createMinisterPositionTask(event) {
    event.preventDefault();

    let {
      administrativeUnit,
      minister,
      contact,
      secondaryContact,
      address,
      position,
    } = this.model;

    yield Promise.all([
      minister.validate(),
      position.validate(),
      contact.validate(),
      secondaryContact.validate(),
      address.validate(),
    ]);

    if (
      minister.isValid &&
      position.isValid &&
      contact.isValid &&
      secondaryContact.isValid &&
      address.isValid
    ) {
      address.fullAddress = combineFullAddress(address);
      yield address.save();

      contact.contactAddress = address;
      yield contact.save();
      yield secondaryContact.save();

      position.worshipService = administrativeUnit;
      yield position.save();

      let financingCodeId = this.willReceiveFinancing
        ? FINANCING_CODE.FOD_FINANCED
        : FINANCING_CODE.SELF_FINANCED;

      let financing = yield this.store.findRecord(
        'financing-code',
        financingCodeId,
        {
          backgroundReload: false,
        }
      );

      minister.ministerPosition = position;
      minister.person = this.targetPerson;
      minister.contacts.pushObjects([contact, secondaryContact]);
      minister.financing = financing;
      yield minister.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.ministers'
      );
    }
  }

  reset() {
    this.personId = null;
    this.positionId = null;
    this.targetPerson = null;
    this.willReceiveFunding = true;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.addressRecord.rollbackAttributes();
    this.model.contactRecord.rollbackAttributes();
    this.model.secondaryContactRecord.rollbackAttributes();
    this.model.positionRecord.rollbackAttributes();
    this.model.ministerRecord.rollbackAttributes();
  }
}
