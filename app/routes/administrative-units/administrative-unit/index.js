import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitIndexRoute extends Route {
  @service router;

  beforeModel() {
    return this.router.replaceWith(
      'administrative-units.administrative-unit.core-data'
    );
  }
}
