import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isWorshipMember } from 'frontend-organization-portal/models/board-position';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-organization-portal/models/address';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditController extends Controller {
  @tracked computedContactDetails;
  @tracked positionsWithSameOldAddress;

  @service router;
  get showHalfElectionTypeSelect() {
    return isWorshipMember(this.model.mandatory.role?.id);
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

    if (mandatory.isValid) {
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
          mandatory.contacts.clear();
          mandatory.contacts.pushObjects([primaryContact, secondaryContact]);
          primaryContactId = primaryContact.id;
        }
      }

      if (contactValid) {
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

  @action
  updateContact(editingContact) {
    this.computedContactDetails = editingContact;
  }
  reset() {
    this.removeUnsavedRecords();
    this.positionsWithSameOldAddress = null;
    this.computedContactDetails = null;
  }

  removeUnsavedRecords() {
    this.model.mandatory.rollbackAttributes();
  }
}