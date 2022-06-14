import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  BOARD_MEMBER_ROLES,
  MANDATARIES_ROLES,
} from 'frontend-organization-portal/models/board-position';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model({ sort }) {
    let { administrativeUnit, governingBodyClassification, governingBody } =
      this.modelFor(
        'administrative-units.administrative-unit.governing-bodies.governing-body'
      );

    let query = {
      filter: {
        mandate: {
          ['governing-body']: {
            [':id:']: governingBody.id,
          },
        },
      },
      include: [
        'governing-alias',
        'mandate.governing-body',
        'mandate.role-board',
      ].join(),
      sort,
    };

    let memberMandatories = await this.store.query('mandatory', {
      ...query,
      ['filter[mandate][role-board][:id:]']: BOARD_MEMBER_ROLES.join(),
    });

    let otherMandatories = await this.store.query('mandatory', {
      ...query,
      // mu-cl-resources doesn't support the inverse of `:id:` yet,
      // so we define all the other ids as a workaround
      // https://github.com/mu-semtech/mu-cl-resources/issues/22
      ['filter[mandate][role-board][:id:]']: MANDATARIES_ROLES.join(),
    });

    return {
      administrativeUnit,
      governingBodyClassification,
      governingBody,
      memberMandatories,
      otherMandatories,
    };
  }
}
