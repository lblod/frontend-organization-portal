import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyEditRoute extends Route {
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    const { administrativeUnit, governingBodyClassification, governingBody } =
      await this.modelFor(
        'administrative-units.administrative-unit.governing-bodies.governing-body'
      );

    return {
      governingBody,
      governingBodyClassification,
      administrativeUnit,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
