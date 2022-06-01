import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { validate as validateDate } from 'frontend-organization-portal/utils/datepicker-validation';

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
  @tracked positionsWithSameOldAddress;

  queryParams = ['redirectUrl'];

  @tracked
  endDateValidation = { valid: true };
  @tracked
  startDateValidation = { valid: true };

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
  validateEndDate(validation) {
    this.endDateValidation = validateDate(validation);
  }

  @action
  validateStartDate(validation) {
    this.startDateValidation = validateDate(validation);
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

    if (
      this.startDateValidation.valid &&
      this.endDateValidation.valid &&
      minister.isValid
    ) {
      let contactValid = true;
      let primaryContactId = null;

      if (this.computedContactDetails) {
        let { primaryContact, secondaryContact, address } =
          this.computedContactDetails;

        yield primaryContact.validate();
        yield secondaryContact.validate();
        yield address.validate();
        contactValid =
          primaryContact.isValid && secondaryContact.isValid && address.isValid;
        if (contactValid) {
          if (address.isDirty) {
            address.fullAddress = combineFullAddress(address);
          }
          primaryContact.contactAddress = address;

          if (address.isDirty) {
            yield address.save();
          }

          if (primaryContact.isDirty) {
            yield primaryContact.save();
          }
          if (secondaryContact.isDirty) {
            yield secondaryContact.save();
          }
          minister.contacts.clear();
          minister.contacts.pushObjects([primaryContact, secondaryContact]);
          primaryContactId = primaryContact.id;
        }
      }

      if (contactValid) {
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

        const oldPrimaryContactId = this.model.contact?.primaryContact?.id;

        if (primaryContactId && primaryContactId !== oldPrimaryContactId) {
          const positionsWithSameOldAddress = this.model.allContacts?.filter(
            (c) =>
              c?.primaryContact?.id === oldPrimaryContactId &&
              c.position?.id !== minister.id
          );
          if (positionsWithSameOldAddress?.length) {
            this.positionsWithSameOldAddress = positionsWithSameOldAddress;
          } else {
            this.handleTransitionTo();
          }
        } else {
          this.handleTransitionTo();
        }
      }
    }
  }

  get endDateErrorMessage() {
    return (
      this.model.minister?.error?.agentEndDate?.validation ||
      this.endDateValidation?.errorMessage
    );
  }
  get startDateErrorMessage() {
    return (
      this.model.minister?.error?.agentStartDate?.validation ||
      this.startDateValidation?.errorMessage
    );
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
    this.endDateValidation = { valid: true };
    this.startDateValidation = { valid: true };
    this.redirectUrl = null;
    this.removeUnsavedRecords();
    this.computedContactDetails = null;
    this.positionsWithSameOldAddress = null;
  }

  removeUnsavedRecords() {
    this.model.minister.rollbackAttributes();
  }
  @action
  handleTransitionTo() {
    if (this.redirectUrl) {
      this.router.transitionTo(this.redirectUrl);
    } else {
      this.router.transitionTo('people.person.positions.minister');
    }
  }
}
