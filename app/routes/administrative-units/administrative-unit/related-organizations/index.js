import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model(params) {
    const administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    const isAssociatedWith = await administrativeUnit.isAssociatedWith;
    const isSubOrganizationOf = await administrativeUnit.isSubOrganizationOf;
    const subOrganizations = await this.loadSubOrganizationsTask.perform(
      administrativeUnit.id,
      params
    );

    return {
      administrativeUnit,
      isAssociatedWith,
      isSubOrganizationOf,
      subOrganizations,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id, params) {
    return yield this.store.query('organization', {
      'filter[is-sub-organization-of][:id:]': id,
      'page[size]': 500,
      include: 'classification',
      sort: params.sort,
    });
  }
}
