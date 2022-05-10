import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationCoreDataRoute extends Route {
  @service store;

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');
    return {
      representativeBody: await this.store.findRecord(
        'representative-body',
        organizationId,
        {
          reload: true,
          include: [
            'organization-status',
            'recognized-worship-type',
            'identifiers.structured-identifier',
            'primary-site.address',
            'primary-site.contacts',
            'resulted-from',
          ].join(),
        }
      ),
    };
  }
}
