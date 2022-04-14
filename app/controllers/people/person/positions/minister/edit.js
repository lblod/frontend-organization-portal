import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

const FINANCING_CODE = {
  SELF_FINANCED: '997073905f839ac6bafe92b76050ab0b',
  FOD_FINANCED: '9d6f49b3d923b437ec3a91e8b5fa6885',
};

export default class PeoplePersonPositionsMinisterEditController extends Controller {
  @service router;
  @service store;
  @tracked computedContactDetails;
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

    let { minister } = this.model;

    yield minister.validate();

    if (minister.isValid) {
      if (this.computedContactDetails) {
        let { primaryContact, secondaryContact, address } =
          this.computedContactDetails;
        if (address.isDirty) {
          yield address.save();
        }

        if (primaryContact.isDirty) {
          yield primaryContact.save();
        }
        if (secondaryContact.isDirty) {
          yield secondaryContact.save();
        }
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

  @action
  updateContact(editingContact) {
    this.computedContactDetails = editingContact;
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
    this.model.minister.rollbackAttributes();
  }

  handleTransitionTo() {
    if (this.redirectUrl) {
      this.router.transitionTo(this.redirectUrl);
    } else {
      this.router.transitionTo('people.person.positions.minister');
    }
  }
}
