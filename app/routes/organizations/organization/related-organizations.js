import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';

export default class OrganizationsOrganizationRelatedOrganizationsRoute extends Route {
  @service store;

  async model() {
    const organization = this.modelFor('organizations.organization');

    const roles = await this.store.query('membership-role', {
      'filter[:id:]': [
        MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
        MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id,
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
      ].join(','),
    });

    return { organization, roles };
  }
}
