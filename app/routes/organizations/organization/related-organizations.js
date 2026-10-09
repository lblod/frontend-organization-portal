import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { query } from '@warp-drive/legacy/compat/builders';
import { MEMBERSHIP_ROLES } from 'frontend-organization-portal/models/membership-role';
import {
  allowedRoleLabelsForClassification,
  allowedRolesForClassification,
} from 'frontend-organization-portal/utils/membership-rules';

export default class OrganizationsOrganizationRelatedOrganizationsRoute extends Route {
  @service store;

  async model() {
    const organization = this.modelFor('organizations.organization');

    const { content: roles } = await this.store.request(
      query('membership-role', {
        'filter[:id:]': MEMBERSHIP_ROLES.map((role) => role.id).join(','),
      }),
    );

    // Only offer the roles the rules allow for the classification. Memberships
    // whose role is no longer offered keep displaying; they are live data.
    const classificationId = organization.classification?.get('id');
    const selectableRoles = roles.filter((role) =>
      allowedRolesForClassification(classificationId).some(
        (selectableRole) => selectableRole.id === role.id,
      ),
    );

    // Labels for the row select on the edit page: the label a user picks
    // determines the direction of the membership and thereby which
    // organizations can be chosen, so only usable labels are offered.
    const selectableRoleLabels = [
      ...new Set(
        selectableRoles.flatMap((role) => [role.opLabel, role.inverseOpLabel]),
      ),
    ].sort();
    const allowedRoleLabels =
      allowedRoleLabelsForClassification(classificationId);

    return {
      organization,
      roles,
      selectableRoles,
      selectableRoleLabels,
      allowedRoleLabels,
    };
  }
}
