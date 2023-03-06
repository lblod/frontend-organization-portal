import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import localInvolvementValidations from 'frontend-organization-portal/validations/local-involvement';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsEditRoute extends Route {
  @service store;
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
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let worshipAdministrativeUnit = await this.store.findRecord(
      'worship-administrative-unit',
      administrativeUnitId,
      {
        reload: true,
        include:
          'involvements.involvement-type,involvements.administrative-unit.classification',
      }
    );

    let involvementTypes;
    const classification = await worshipAdministrativeUnit.classification;
    if (classification.id == CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE) {
      involvementTypes = await this.store.query('involvement-type', {
        filter: {
          id: 'ac400cc9f135ac7873fb3e551ec738c1', // Toezichthoundend
        },
      });
    } else {
      involvementTypes = await this.store.query('involvement-type', {});
    }
    let involvements = await worshipAdministrativeUnit.involvements;
    involvements = involvements.map((involvement) => {
      return createValidatedChangeset(involvement, localInvolvementValidations);
    });

    let involvementTypesProvince = involvementTypes
      .toArray()
      .filter((it) => it.id !== '0f845f00ee76099c89518cbaf6a7b77f'); // Non adviserend

    return {
      worshipAdministrativeUnit,
      involvements,
      involvementTypes,
      involvementTypesProvince,
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
