import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { addPaginationMeta } from 'frontend-contact-hub/utils/data-table';

// const CLASSIFICATION = {
//   MUNICIPALITY: {
//     id: '5ab0e9b8a3b2ca7c5e000001',
//   },
//   PROVINCE: {
//     id: '5ab0e9b8a3b2ca7c5e000000',
//   },
// };

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsEditRoute extends Route {
  @service store;

  async model() {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let administrativeUnit = await this.store.findRecord(
      'worship-service',
      administrativeUnitId,
      {
        reload: true,
        include:
          'involvements.involvement-type,involvements.administrative-unit.classification',
      }
    );

    let localAdministrativeUnits = await this.store.findAll(
      'administrative-unit'
    );

    let involvementTypes = await this.store.findAll('involvement-type');

    let involvements = await administrativeUnit.involvements;

    addPaginationMeta(involvements);

    return {
      administrativeUnit,
      involvements,
      involvementTypes,
      localAdministrativeUnits,
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
