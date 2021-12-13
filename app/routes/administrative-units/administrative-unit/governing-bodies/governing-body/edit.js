import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyEditRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', { wildcard: 'not-found' });
    }
  }

  model() {
    return this.modelFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );
  }
}
