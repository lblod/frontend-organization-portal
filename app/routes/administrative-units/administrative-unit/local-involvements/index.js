import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsIndexRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let involvements = await this.store.query('local-involvement', {
      include: 'involvement-type,administrative-unit.classification',
      filter: {
        ['worship-service']: {
          [':id:']: administrativeUnit.id,
        },
      },
    });

    return {
      administrativeUnit,
      involvements,
    };
  }
}
