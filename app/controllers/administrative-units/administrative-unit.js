import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitController extends Controller {
  @tracked isEditingCore = false;
  @tracked isShowingCore = true;

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
  async editCoreInfo(event) {

    event.preventDefault();

    await this.model.save();

    this.toggleShowCoreInfo();
  }


}
