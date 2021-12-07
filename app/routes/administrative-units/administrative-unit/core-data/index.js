import Route from '@ember/routing/route';

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexRoute extends Route {
  model() {
    const { id } = this.paramsFor('administrative-units.administrative-unit');
    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit.core-data'
      ),
      subOrganizations: this.store.query('organization', {
        include: 'classification',
        'filter[is-sub-organization-of][:id:]': id,
        'page[size]': 500,
      }),
    };
  }
}
