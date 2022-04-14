import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';

const FINANCING_CODE = {
  SELF_FINANCED: '997073905f839ac6bafe92b76050ab0b',
  FOD_FINANCED: '9d6f49b3d923b437ec3a91e8b5fa6885',
};

export default class AdministrativeUnitsAdministrativeUnitMinistersNewController extends Controller {
  @service router;
  @service store;
  @service contactDetails;

  queryParams = ['personId', 'positionId'];

  @tracked computedContactDetails;
  @tracked personId;
  @tracked positionId;
  @tracked targetPerson = null;
  @tracked willReceiveFinancing = true;
  @tracked contact = null;
  @tracked allContacts = null;

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

    if (minister.isValid && position.isValid) {
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
        minister.contacts.pushObjects([primaryContact, secondaryContact]);
      }
      minister.ministerPosition = position;
      minister.person = this.targetPerson;
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
  @action
  updateContact(editingContact) {
    this.computedContactDetails = editingContact;
  }
  removeUnsavedRecords() {
    this.model.positionRecord.rollbackAttributes();
    this.model.ministerRecord.rollbackAttributes();
  }
}
