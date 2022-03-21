import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { isWorshipMember } from 'frontend-organization-portal/models/board-position';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditController extends Controller {
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

    let { mandatory, governingBody, contact, secondaryContact, address } =
      this.model;

    yield Promise.all([
      mandatory.validate(),
      contact.validate(),
      secondaryContact.validate(),
      address.validate(),
    ]);

    if (
      contact.isValid &&
      secondaryContact.isValid &&
      mandatory.isValid &&
      address.isValid
    ) {
      if (address.isDirty) {
        address.fullAddress = combineFullAddress(address);

        if (address.isNew) {
          contact.contactAddress = address;
        }

        yield address.save();
      }

      let contacts = yield mandatory.contacts;
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

      yield mandatory.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.governing-bodies.governing-body',
        governingBody.id
      );
    }
  }

  reset() {
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.addressRecord.rollbackAttributes();
    this.model.contactRecord.rollbackAttributes();
    this.model.secondaryContactRecord.rollbackAttributes();
  }
}
