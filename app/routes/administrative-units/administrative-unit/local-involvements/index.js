import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model(params) {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let query = {
      include: 'involvement-type,administrative-unit.classification',
      filter: {
        ['worship-service']: {
          [':id:']: administrativeUnit.id,
        },
      },
      sort: params.sort,
    };

    let involvements = await this.store.query('local-involvement', query);

    return {
      administrativeUnit,
      involvements,
    };
  }
}
