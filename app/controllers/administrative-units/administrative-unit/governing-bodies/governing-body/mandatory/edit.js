import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isWorshipMember } from 'frontend-organization-portal/models/board-position';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryEditController extends Controller {
  @tracked computedContactDetails;

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

    let { mandatory, governingBody } = this.model;
    yield mandatory.validate();

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
    if (mandatory.isValid) {
      yield mandatory.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.governing-bodies.governing-body',
        governingBody.id
      );
    }
  }

  @action
  updateContact(editingContact) {
    this.computedContactDetails = editingContact;
  }
  reset() {
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.mandatory.rollbackAttributes();
  }
}
