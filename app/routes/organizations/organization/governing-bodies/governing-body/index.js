import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
import {
  BOARD_MEMBER_ROLES,
  MANDATARIES_ROLES,
} from 'frontend-organization-portal/models/board-position-code';
import { hasUnifiedMandatories } from 'frontend-organization-portal/models/governing-body-classification-code';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
    mandatoriesPage: { refreshModel: true },
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

    let allMandatories = [];
    let memberMandatories = [];
    let otherMandatories = [];

    if (hasUnifiedMandatories(governingBodyClassification)) {
      allMandatories = (
        await this.store.request(
          queryBuilder('mandatory', {
            ...query,
            page: {
              size: params.size,
              number: params.mandatoriesPage,
            },
          }),
        )
      ).content;
    } else {
      memberMandatories = (
        await this.store.request(
          queryBuilder('mandatory', {
            ...query,
            ['filter[mandate][role-board][:id:]']: BOARD_MEMBER_ROLES.join(),
            page: {
              size: params.size,
              number: params.page,
            },
          }),
        )
      ).content;

      otherMandatories = (
        await this.store.request(
          queryBuilder('mandatory', {
            ...query,
            // mu-cl-resources doesn't support the inverse of `:id:` yet,
            // so we define all the other ids as a workaround
            // https://github.com/mu-semtech/mu-cl-resources/issues/22
            ['filter[mandate][role-board][:id:]']: MANDATARIES_ROLES.join(),
            page: {
              size: params.size,
              number: params.mandatoriesPage,
            },
          }),
        )
      ).content;
    }

    return {
      organization,
      governingBodyClassification,
      governingBody,
      allMandatories,
      memberMandatories,
      otherMandatories,
    };
  }
}
