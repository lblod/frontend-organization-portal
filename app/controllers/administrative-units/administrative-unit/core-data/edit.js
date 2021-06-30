import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditController extends Controller {
  @service router;

  get administrativeUnit() {
    return this.model.administrativeUnit;
  }

  get isSaving() {
    return this.editCoreInfoTask.isRunning;
  }

  get isSavingContact() {
    return this.editContactInfoTask.isRunning;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let primarySite = yield this.administrativeUnit.primarySite;

    let address = yield primarySite.address;
    yield address.save();

    let contacts = yield primarySite.contacts;
    yield contacts.firstObject.save();

    yield primarySite.save();

    yield this.administrativeUnit.save();

    this.router.transitionTo(
      'administrative-administrative-units.administrative-unit.core-data',
      this.administrativeUnit.id
    );
  }
}
