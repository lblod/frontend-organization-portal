import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

const MANDATORY_ROLE = {
  WORSHIP_MEMBER: '2e021095727b2464459a63e16ebeafd2',
};

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryNewController extends Controller {
  @service router;
  @service store;

  @tracked targetPerson = null;

  get isSelectingTargetPerson() {
    return !this.targetPerson;
  }

  get showHalfElectionTypeSelect() {
    return (
      this.model.mandate.roleBoard.get('id') === MANDATORY_ROLE.WORSHIP_MEMBER
    );
  }

  @action
  handleMandateRoleSelect(role) {
    this.model.mandate.roleBoard = role;

    if (role !== MANDATORY_ROLE.WORSHIP_MEMBER) {
      this.model.mandatory.typeHalf = undefined;
    }
  }

  @dropTask
  *createMandatoryPositionTask(event) {
    event.preventDefault();

    let { mandatory, mandate, governingBody, contact, contactMobile, address } =
      this.model;

    address.fullAddress = combineFullAddress(address);
    yield address.save();

    contact.contactAddress = address;
    yield contact.save();
    yield contactMobile.save();

    mandate.governingBody = governingBody;
    yield mandate.save();

    mandatory.governingAlias = this.targetPerson;
    mandatory.contacts.pushObjects([contact, contactMobile]);
    mandatory.mandate = mandate;
    mandatory.save();

    this.router.transitionTo(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );
  }

  reset() {
    this.targetPerson = null;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.mandatory.rollbackAttributes();
    this.model.mandate.rollbackAttributes();
    this.model.contact.rollbackAttributes();
    this.model.contactMobile.rollbackAttributes();
    this.model.address.rollbackAttributes();
  }
}
