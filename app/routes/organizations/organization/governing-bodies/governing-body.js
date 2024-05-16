import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyRoute extends Route {
  @service store;

  async model({ governingBodyId }) {
    const organization = this.modelFor('organizations.organization');

    const governingBody = await this.store.findRecord(
      'governing-body',
      governingBodyId,
      {
        reload: true,
        include: 'mandates.role-board,mandates.held-by.governing-alias',
      }
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
