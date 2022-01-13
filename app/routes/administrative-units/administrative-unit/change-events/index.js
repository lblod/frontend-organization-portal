import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let changeEventResults = await this.store.query('change-event-result', {
      'filter[resulting-organization][:id:]': administrativeUnitId,
      include: ['result-from.type', 'status', 'resulting-organization'].join(),
      page: {
        number: params.page,
        size: params.size,
      },
      sort: params.sort,
    });

    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit'
      ),
      changeEventResults,
    };
  }
}
