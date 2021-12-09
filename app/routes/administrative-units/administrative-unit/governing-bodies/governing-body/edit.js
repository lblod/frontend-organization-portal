import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyEditRoute extends Route {
  @service currentSession;
  @service session;

  beforeModel() {
    if (!this.currentSession.hasAllowedRole) {
      this.session.invalidate();
    }
  }

  model() {
    return this.modelFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );
  }
}
