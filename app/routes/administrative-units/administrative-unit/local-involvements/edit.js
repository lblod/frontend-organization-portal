import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { addPaginationMeta } from 'frontend-contact-hub/utils/data-table';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsEditRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let involvements = await this.store
      .query('local-involvement', {
        include: 'involvement-type,administrative-unit.classification',
        filter: {
          ['worship-service']: {
            [':id:']: administrativeUnit.id,
          },
        },
      })
      .toArray(); // the result of store.query is immutable so we convert it to something mutable.

    addPaginationMeta(involvements);

    return {
      administrativeUnit,
      involvements,
    };
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setup(model);
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
