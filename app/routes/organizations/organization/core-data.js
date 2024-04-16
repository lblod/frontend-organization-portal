import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationCoreDataRoute extends Route {
  @service store;

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    return await this.store.findRecord('organization', organizationId, {
      reload: true,
      include: [
        'classification',
        'organization-status',
        //'recognized-worship-type', // TODO: not in organization model, was also commented in original administrative-unit route
        'identifiers.structured-identifier',
        'primary-site.address',
        'primary-site.contacts',
        'is-sub-organization-of',
        'is-associated-with',
        'resulted-from',
        'was-founded-by-organizations',
        'kbo-organization',
      ].join(),
    });
  }
}
