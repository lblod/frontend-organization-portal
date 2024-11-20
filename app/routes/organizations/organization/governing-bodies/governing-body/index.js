import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  BOARD_MEMBER_ROLES,
  MANDATARIES_ROLES,
} from 'frontend-organization-portal/models/board-position-code';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    let { organization, governingBodyClassification, governingBody } =
      this.modelFor(
        'organizations.organization.governing-bodies.governing-body',
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
      sort: params.sort,
    };

    let memberMandatories = await this.store.query('mandatory', {
      ...query,
      ['filter[mandate][role-board][:id:]']: BOARD_MEMBER_ROLES.join(),
      page: {
        size: params.size,
        number: params.page,
      },
    });

    // NOTE (29/10/24): Workaround for the data issue that for some mandatories
    // their name is stored twice, once with a language tag and once
    // without. This can be removed again once the data is cleaned up.
    memberMandatories = memberMandatories.filter(
      (mandatory, index, memberMandatories) =>
        index === memberMandatories.findIndex((m) => mandatory.id === m.id),
    );

    let otherMandatories = await this.store.query('mandatory', {
      ...query,
      // mu-cl-resources doesn't support the inverse of `:id:` yet,
      // so we define all the other ids as a workaround
      // https://github.com/mu-semtech/mu-cl-resources/issues/22
      ['filter[mandate][role-board][:id:]']: MANDATARIES_ROLES.join(),
    });

    // NOTE (29/10/24): Workaround for the data issue that for some mandatories
    // their name is stored twice, once with a language tag and once
    // without. This can be removed again once the data is cleaned up.
    otherMandatories = otherMandatories.filter(
      (mandatory, index, otherMandatories) =>
        index === otherMandatories.findIndex((m) => mandatory.id === m.id),
    );

    return {
      organization,
      governingBodyClassification,
      governingBody,
      memberMandatories,
      otherMandatories,
    };
  }
}
