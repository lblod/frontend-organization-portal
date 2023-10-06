import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import { validate as validateDate } from 'frontend-organization-portal/utils/datepicker';

const FINANCING_CODE = {
  SELF_FINANCED: '997073905f839ac6bafe92b76050ab0b',
  FOD_FINANCED: '9d6f49b3d923b437ec3a91e8b5fa6885',
};

export default class AdministrativeUnitsAdministrativeUnitMinistersNewController extends Controller {
  @service router;
  @service store;
  @service contactDetails;
  @service errorReport;

  queryParams = ['personId', 'positionId'];

  @tracked computedContactDetails;
  @tracked personId;
  @tracked positionId;
  @tracked targetPerson = null;
  @tracked willReceiveFinancing = true;
  @tracked contact = null;
  @tracked allContacts = null;
  @tracked targetPersonError = false;

  @tracked
  endDateValidation = { valid: true };
  @tracked
  startDateValidation = { valid: true };

  @action
  validateEndDate(validation) {
    this.endDateValidation = validateDate(validation);
  }

  @action
  validateStartDate(validation) {
    this.startDateValidation = validateDate(validation);
  }

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
  *selectTargetPerson(p) {
    const { person, positions } =
      yield this.contactDetails.getPersonAndAllPositions(p.id);
    this.allContacts = yield this.contactDetails.positionsToEditableContacts(
      positions
    );
    this.contact = { position: this.model.minister };
    this.targetPerson = person;
  }

  @dropTask
  *createMinisterPositionTask(event) {
    event.preventDefault();

    let { administrativeUnit, minister, position } = this.model;

    yield Promise.all([minister.validate(), position.validate()]);

    if (!this.targetPerson) {
      yield this.errorReport.reportError(
        'Unexpected error while adding a minister',
        `Target person was empty. Url: '${window.location.href}'`
      );
      this.targetPersonError = true;
    } else if (
      this.startDateValidation.valid &&
      this.endDateValidation.valid &&
      minister.isValid &&
      position.isValid
    ) {
      let contactValid = true;
      let allContactFieldsEmpty = this.contactDetails.isAllFieldsEmpty(
        this.computedContactDetails
      );

      if (this.computedContactDetails && !allContactFieldsEmpty) {
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
            address = setEmptyStringsToNull(address);
            yield address.save();
          }

          primaryContact.contactAddress = address;

          if (primaryContact.isDirty) {
            primaryContact = setEmptyStringsToNull(primaryContact);
            yield primaryContact.save();
          }
          if (secondaryContact.isDirty) {
            secondaryContact = setEmptyStringsToNull(secondaryContact);
            yield secondaryContact.save();
          }
          minister.contacts.clear();
          minister.contacts.push(primaryContact, secondaryContact);
        }
      }
      if (contactValid) {
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
        minister.financing = financing;
        yield minister.save();

        this.router.transitionTo(
          'administrative-units.administrative-unit.ministers'
        );
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
  reset() {
    this.endDateValidation = { valid: true };
    this.startDateValidation = { valid: true };
    this.personId = null;
    this.positionId = null;
    this.targetPerson = null;
    this.willReceiveFunding = true;
    this.computedContactDetails = null;
    this.contact = null;
    this.allContacts = null;
    this.removeUnsavedRecords();
  }
  @action
  updateContact(editingContact) {
    this.computedContactDetails = editingContact;
  }
  removeUnsavedRecords() {
    this.model.positionRecord.rollbackAttributes();
    this.model.ministerRecord.rollbackAttributes();
  }
}
