import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitSitesNewRoute extends Route {
  @service store;

  async model() {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      administrativeUnitId,
      {
        reload: true,
        include: ['primary-site', 'sites'].join(),
      }
    );

    return {
      administrativeUnit: administrativeUnit,
      site: this.store.createRecord('site'),
      address: this.store.createRecord('address'),
      contact: this.store.createRecord('contact-point'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
