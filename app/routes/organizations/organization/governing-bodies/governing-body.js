import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyRoute extends Route {
  @service store;

  async model({ governingBodyId }) {
    const organization = this.modelFor('organizations.organization');

    const { content: governingBody } = await this.store.request(
      findRecord('governing-body', governingBodyId, {
        reload: true,
        include: 'mandates.role-board,mandates.held-by.governing-alias',
      }),
    );

    const untimedGoverningBodiy = await governingBody.isTimeSpecializationOf;
    const governingBodyClassification =
      await untimedGoverningBodiy.classification;

    return {
      organization,
      governingBodyClassification,
      governingBody,
    };
  }
}
