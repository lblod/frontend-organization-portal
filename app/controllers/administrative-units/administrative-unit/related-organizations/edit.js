import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditController extends Controller {
  @service router;

  @action
  addNewSubOrganization() {
    let subOrganization = this.store.createRecord('organization');
    this.model.administrativeUnit.subOrganizations.pushObject(subOrganization);
  }

  @action
  updateSubOrganization(removedOrganization, addedOrganization) {
    this.model.administrativeUnit.subOrganizations.removeObject(
      removedOrganization
    );
    this.model.administrativeUnit.subOrganizations.pushObject(
      addedOrganization
    );
  }

  @action
  removeSubOrganization(organization) {
    this.model.administrativeUnit.subOrganizations.removeObject(organization);
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { administrativeUnit } = this.model;

    yield administrativeUnit.validate();

    if (administrativeUnit.isValid) {
      yield administrativeUnit.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.related-organizations',
        administrativeUnit.id
      );
    }
  }
}
