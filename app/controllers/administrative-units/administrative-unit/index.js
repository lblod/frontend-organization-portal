import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitIndexController extends Controller {
  @tracked isSaving = false;
  @tracked isSavingContact = false;

  @tracked isEditingCore = false;
  @tracked isShowingCore = true;

  @tracked isEditingContact = false;
  @tracked isShowingContact = true;

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
  async editCoreInfo(event) {
    event.preventDefault();

    if (!this.isSaving) {
      this.isSaving = true;

      await this.model.administrativeUnit.save();

      this.isSaving = false;
    }

    this.toggleShowCoreInfo();
  }

  @action
  setOrganizationStatus(administrativeUnit, selection) {
    administrativeUnit.status = selection;
  }

  @action
  setHonoraryServiceType(administrativeUnit, selection) {
    administrativeUnit.honoraryServiceType = selection;
  }

  @action
  async editContactInfo(event) {
    event.preventDefault();

    if (!this.isSavingContact) {
      this.isSavingContact = true;

      let address = await this.model.administrativeUnit.primarySite.get(
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

      await this.model.administrativeUnit.save();

      this.isSavingContact = false;
    }

    this.toggleShowContactInfo();
  }
}
