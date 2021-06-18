import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

export default class AdministrativeUnitsAdministrativeUnitIndexController extends Controller {
  @tracked isSaving = false;
  @tracked isSavingContact = false;

  @tracked isEditingCore = false;
  @tracked isShowingCore = true;

  @tracked isEditingContact = false;
  @tracked isShowingContact = true;

  get isSaving() {
    return this.editCoreInfoTask.isRunning;
  }

  get isSavingContact() {
    return this.editContactInfoTask.isRunning;
  }

  @action
  toggleEditCoreInfo() {
    this.isEditingCore = !this.isEditingCore;
    this.isShowingCore = false;
  }

  @action
  toggleShowCoreInfo() {
    this.isShowingCore = !this.isShowingCore;
    this.isEditingCore = false;
  }

  @action
  toggleEditContactInfo() {
    this.isEditingContact = !this.isEditingContact;
    this.isShowingContact = false;
  }

  @action
  toggleShowContactInfo() {
    this.isShowingContact = !this.isShowingContact;
    this.isEditingContact = false;
  }

  @action
  setOrganizationStatus(administrativeUnit, selection) {
    administrativeUnit.organizationStatus = selection;
  }

  @action
  setHonoraryServiceType(administrativeUnit, selection) {
    administrativeUnit.honoraryServiceType = selection;
  }

  @dropTask
  *editCoreInfoTask(event) {
    event.preventDefault();

    yield this.model.administrativeUnit.save();

    this.toggleShowCoreInfo();
  }

  @dropTask
  *editContactInfoTask(event) {
    event.preventDefault();

    let address = yield this.model.administrativeUnit.primarySite.get(
      'address'
    );

    address.fullAddress =
      address.street +
      ' ' +
      address.number +
      ' ' +
      address.boxNumber +
      ' ' +
      address.postcode +
      ' ' +
      address.municipality;

    yield this.model.administrativeUnit.save();

    this.toggleShowContactInfo();
  }
}
