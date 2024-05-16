import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationMinistersIndexRoute extends Route {
  @service store;

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    let organization = await this.store.findRecord(
      'worship-service',
      organizationId,
      {
        reload: true,
        include: [
          'minister-positions.function',
          'minister-positions.held-by-ministers.person',
        ].join(),
      }
    );

    let ministerPositions = await organization.ministerPositions;
    let ministers = [];

    for (const ministerPosition of ministerPositions.slice()) {
      const heldByMinisters = await ministerPosition.heldByMinisters;
      if (heldByMinisters.length) {
        ministers.push(...heldByMinisters.slice());
      }
    }

    return {
      organization,
      ministers,
    };
  }
}
