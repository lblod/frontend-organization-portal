import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitExecutivesRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      administrativeUnitId
    );

    let functionaries = await this.store.query('functionary', {
      'filter[board-position][governing-bodies][is-time-specialization-of][administrative-unit][:id:]':
        administrativeUnitId,
      sort: params.sort,
      page: { number: params.number, size: params.size },
    });

    return {
      administrativeUnit,
      functionaries,
    };
  }
}
