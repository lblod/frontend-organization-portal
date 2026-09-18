import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { query } from '@warp-drive/legacy/compat/builders';
import { MEMBERSHIP_ROLES } from 'frontend-organization-portal/models/membership-role';

export default class OrganizationsOrganizationRelatedOrganizationsRoute extends Route {
  @service store;

  async model() {
    const organization = this.modelFor('organizations.organization');

    const { content: roles } = await this.store.request(
      query('membership-role', {
        'filter[:id:]': MEMBERSHIP_ROLES.map((role) => role.id).join(','),
      }),
    );

    // Worship organizations only use the generic "has a relation with" role.
    // Other organizations get the specific roles; their existing generic
    // memberships stay visible but no new ones can be created.
    const isWorship = Boolean(
      organization.isWorshipAdministrativeUnit ||
      organization.isRepresentativeBody,
    );
    const selectableRoles = roles.filter(
      (role) => role.hasRelationWith === isWorship,
    );

    return { organization, roles, selectableRoles };
  }
}
