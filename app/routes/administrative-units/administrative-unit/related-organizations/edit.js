import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    const { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    const administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      administrativeUnitId,
      {
        reload: true,
        include: 'organization-status,was-founded-by-organizations',
      }
    );

    const subOrganizations = await administrativeUnit.subOrganizations;
    const hasParticipants = await administrativeUnit.hasParticipants;

    return {
      administrativeUnit,
      subOrganizations,
      hasParticipants,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
