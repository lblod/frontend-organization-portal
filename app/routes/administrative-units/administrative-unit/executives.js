import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitExecutivesRoute extends Route {
  @service store;

  async model() {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      administrativeUnitId
    );

    let agents = await this.store.query('agent', {
      'filter[board-position][governing-bodies][is-time-specialization-of][administrative-unit][:id:]':
        administrativeUnitId,
    });

    return {
      administrativeUnit,
      agents,
    };
  }
}
