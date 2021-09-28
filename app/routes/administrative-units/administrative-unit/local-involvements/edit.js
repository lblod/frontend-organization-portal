import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import localInvolvementValidations from 'frontend-contact-hub/validations/local-involvement';

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

    let involvementTypes = await this.store.findAll('involvement-type');

    let involvements = await administrativeUnit.involvements;
    involvements = involvements.map((involvement) => {
      return createValidatedChangeset(involvement, localInvolvementValidations);
    });

    return {
      administrativeUnit,
      involvements,
      involvementTypes,
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
