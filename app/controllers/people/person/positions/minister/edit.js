import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

const FINANCING_CODE = {
  SELF_FINANCED: '997073905f839ac6bafe92b76050ab0b',
  FOD_FINANCED: '9d6f49b3d923b437ec3a91e8b5fa6885',
};

export default class PeoplePersonPositionsMinisterEditController extends Controller {
  @service router;
  @tracked willReceiveFinancing;
  @tracked redirectUrl;

  queryParams = ['redirectUrl'];

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

  @action
  cancel() {
    this.handleTransitionTo();
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { minister, contact, secondaryContact, address } = this.model;

    yield Promise.all([
      contact.validate(),
      secondaryContact.validate(),
      minister.validate(),
      address.validate(),
    ]);

    if (
      minister.isValid &&
      contact.isValid &&
      secondaryContact.isValid &&
      address.isValid
    ) {
      if (address.isDirty) {
        address.fullAddress = combineFullAddress(address);
        yield address.save();
      }

      contact.contactAddress = address;
      let contacts = yield minister.contacts;

      if (contact.isDirty) {
        if (contact.isNew) {
          contacts.pushObject(contact);
        }
        yield contact.save();
      }

      if (secondaryContact.isDirty) {
        if (secondaryContact.isNew) {
          contacts.pushObject(secondaryContact);
        }
        yield secondaryContact.save();
      }

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

      minister.financing = financing;
      yield minister.save();

      this.handleTransitionTo();
    }
  }

  setup() {
    this.willReceiveFinancing =
      this.model.minister.financing.get('id') === FINANCING_CODE.FOD_FINANCED;
  }

  reset() {
    this.redirectUrl = null;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.addressRecord.rollbackAttributes();
    this.model.contactRecord.rollbackAttributes();
    this.model.secondaryContactRecord.rollbackAttributes();
  }

  handleTransitionTo() {
    if (this.redirectUrl) {
      this.router.transitionTo(this.redirectUrl);
    } else {
      this.router.transitionTo('people.person.positions.minister');
    }
  }
}
