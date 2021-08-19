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
  @tracked selectedRole = null;

  get isSelectingTargetPerson() {
    return !this.targetPerson;
  }

  get showHalfElectionTypeSelect() {
    return this.selectedRole?.id === MANDATORY_ROLE.WORSHIP_MEMBER;
  }

  @action
  async handleMandateRoleSelect(role) {
    this.model.mandatory.typeHalf = undefined;
    this.selectedRole = role;
  }

  @dropTask
  *createMandatoryPositionTask(event) {
    event.preventDefault();

    let { mandatory, governingBody, contact, contactMobile, address } =
      this.model;

    address.fullAddress = combineFullAddress(address);
    yield address.save();

    contact.contactAddress = address;
    yield contact.save();
    yield contactMobile.save();

    let mandates = yield governingBody.mandates;
    let mandate = findExistingMandateByRole(mandates, this.selectedRole);

    if (!mandate) {
      mandate = this.store.createRecord('mandate');
      mandate.roleBoard = this.selectedRole;
      mandate.governingBody = governingBody;
      yield mandate.save();
    }

    mandatory.governingAlias = this.targetPerson;
    mandatory.contacts.pushObjects([contact, contactMobile]);
    mandatory.mandate = mandate;
    yield mandatory.save();

    this.router.transitionTo(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );
  }

  reset() {
    this.targetPerson = null;
    this.selectedRole = null;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.mandatory.rollbackAttributes();
    this.model.contact.rollbackAttributes();
    this.model.contactMobile.rollbackAttributes();
    this.model.address.rollbackAttributes();
  }
}

function findExistingMandateByRole(mandates, role) {
  return mandates.find((mandate) => {
    return mandate.roleBoard.get('id') === role.id;
  });
}
