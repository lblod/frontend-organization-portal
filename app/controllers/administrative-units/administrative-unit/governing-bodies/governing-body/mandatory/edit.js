import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isWorshipMember } from 'frontend-organization-portal/models/board-position';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { validate as validateDate } from 'frontend-organization-portal/utils/datepicker-validation';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditController extends Controller {
  @tracked computedContactDetails;
  @tracked positionsWithSameOldAddress;

  @tracked
  endDateValidation = { valid: true };
  @tracked
  expectedEndDateValidation = { valid: true };
  @tracked
  startDateValidation = { valid: true };

  @service router;
  get showHalfElectionTypeSelect() {
    return isWorshipMember(this.model.mandatory.role?.id);
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
  validateExpectedEndDate(validation) {
    this.expectedEndDateValidation = validateDate(validation);
  }

  @action
  handleEndDateChange(endDate) {
    let { mandatory } = this.model;
    mandatory.endDate = endDate;

    if (!endDate) {
      mandatory.isCurrentPosition = true;
    } else {
      mandatory.isCurrentPosition = false;
    }
  }

  @action
  handleIsCurrentPositionChange() {
    let { mandatory } = this.model;
    let isCurrentPosition = mandatory.isCurrentPosition;

    if (!isCurrentPosition) {
      mandatory.endDate = undefined;
      mandatory.reasonStopped = undefined;
    }

    mandatory.isCurrentPosition = !isCurrentPosition;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { mandatory } = this.model;
    yield mandatory.validate();

    if (
      this.startDateValidation.valid &&
      this.endDateValidation.valid &&
      this.expectedEndDateValidation.valid &&
      mandatory.isValid
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

            if (address.street === '') {
              address.street = null;
            }
            if (address.number === '') {
              address.number = null;
            }
            if (address.boxNumber === '') {
              address.boxNumber = null;
            }
            if (address.postcode === '') {
              address.postcode = null;
            }
            if (address.municipality === '') {
              address.municipality = null;
            }
            if (address.provincie === '') {
              address.provincie = null;
            }

            yield address.save();
          }

          primaryContact.contactAddress = address;

          if (primaryContact.isDirty) {
            if (primaryContact.email === '') {
              primaryContact.email = null;
            }
            if (primaryContact.telephone === '') {
              primaryContact.telephone = null;
            }
            yield primaryContact.save();
          }
          if (secondaryContact.isDirty) {
            if (secondaryContact.telephone === '') {
              secondaryContact.telephone = null;
            }
            yield secondaryContact.save();
          }
          mandatory.contacts.clear();
          mandatory.contacts.pushObjects([primaryContact, secondaryContact]);
          primaryContactId = primaryContact.id;
        }
      }

      if (contactValid) {
        if (mandatory.reasonStopped === '') {
          mandatory.reasonStopped = null;
        }
        yield mandatory.save();
        const oldPrimaryContactId = this.model.contact?.primaryContact?.id;

        if (primaryContactId && primaryContactId !== oldPrimaryContactId) {
          const positionsWithSameOldAddress = this.model.allContacts?.filter(
            (c) =>
              c?.primaryContact?.id === oldPrimaryContactId &&
              c.position?.id !== mandatory.id
          );
          if (positionsWithSameOldAddress?.length) {
            this.positionsWithSameOldAddress = positionsWithSameOldAddress;
          } else {
            this.onTransition();
          }
        } else {
          this.onTransition();
        }
      }
    }
  }

  @action
  onTransition() {
    let { governingBody } = this.model;
    this.router.transitionTo(
      'administrative-units.administrative-unit.governing-bodies.governing-body',
      governingBody.id
    );
  }

  get endDateErrorMessage() {
    return (
      this.model.mandatory?.error?.endDate?.validation ||
      this.endDateValidation?.errorMessage
    );
  }
  get expectedEndDateErrorMessage() {
    return (
      this.model.mandatory?.error?.expectedEndDate?.validation ||
      this.expectedEndDateValidation?.errorMessage
    );
  }
  get startDateErrorMessage() {
    return (
      this.model.mandatory?.error?.startDate?.validation ||
      this.startDateValidation?.errorMessage
    );
  }

  @action
  updateContact(editingContact) {
    this.computedContactDetails = editingContact;
  }

  reset() {
    this.endDateValidation = { valid: true };
    this.startDateValidation = { valid: true };
    this.expectedEndDateValidation = { valid: true };
    this.removeUnsavedRecords();
    this.positionsWithSameOldAddress = null;
    this.computedContactDetails = null;
  }

  removeUnsavedRecords() {
    this.model.mandatory.rollbackAttributes();
  }
}
