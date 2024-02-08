import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

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

  async model(params) {
    let administrativeUnit = await this.modelFor(
      'administrative-units.administrative-unit.related-organizations'
    );

    const subOrganizations = (
      await this.loadSubOrganizationsTask.perform(administrativeUnit.id, params)
    ).toArray();

    const hasParticipants = (
      await this.loadHasParticipantsTask.perform(administrativeUnit.id, params)
    ).toArray();

    return {
      administrativeUnit,
      subOrganizations,
      hasParticipants,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id, params) {
    return yield this.store.query('administrative-unit', {
      'filter[is-sub-organization-of][:id:]': id,
      'page[size]': 500,
      include: 'classification',
      sort: params.sort,
    });
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadHasParticipantsTask(id, params) {
    return yield this.store.query('administrative-unit', {
      'filter[participates-in][:id:]': id,
      'page[size]': 500,
      include: 'classification',
      sort: params.sort,
    });
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
