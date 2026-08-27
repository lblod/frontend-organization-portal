import Route from '@ember/routing/route';
import { service } from '@ember/service';
// import { findRecord } from '@warp-drive/legacy/compat/builders';
import { findRecord } from '@warp-drive/utilities/json-api';

export default class OrganizationsOrganizationMinistersIndexRoute extends Route {
  @service store;

  async model() {
    const { id: organizationId } = this.paramsFor('organizations.organization');

    const { content: organization } = await this.store.request(
      findRecord('worship-service', organizationId, {
        reload: true,
        include: [
          'minister-positions.function',
          'minister-positions.held-by-ministers.person',
        ].join(),
      }),
    );

    let ministerPositions = await organization.data.ministerPositions;
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
