import Route from '@ember/routing/route';
import { dropTask } from 'ember-concurrency';

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexRoute extends Route {
  model() {
    const { id } = this.paramsFor('administrative-units.administrative-unit');
    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit.core-data'
      ),
      subOrganizations: this.loadSubOrganizationsTask.perform(id),
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id) {
    yield this.store.query('organization', {
      include: 'classification',
      'filter[is-sub-organization-of][:id:]': id,
      'page[size]': 500,
    });
  }
}
