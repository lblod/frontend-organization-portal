import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { query } from '@warp-drive/legacy/compat/builders';
import {
  MEMBERSHIP_ROLES,
  MEMBERSHIP_ROLES_MAPPING,
} from 'frontend-organization-portal/models/membership-role';
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
    let selectableRoles = roles.filter((role) =>
      allowedRolesForClassification(classificationId).some(
        (selectableRole) => selectableRole.id === role.id,
      ),
    );

    // The generic "has a relation with" role is no longer offered to
    // non-worship types, but their stored generic relations are live data:
    // keep the role filterable when the organization has such relations.
    if (
      !selectableRoles.some((role) => role.hasRelationWith) &&
      (await this.#hasStoredGenericRelations(organization))
    ) {
      selectableRoles = [
        ...selectableRoles,
        ...roles.filter((role) => role.hasRelationWith),
      ];
    }

    // Labels for the role filters above the view and edit tables.
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

  /**
   * Whether the organization has stored memberships with the generic
   * "has a relation with" role.
   */
  async #hasStoredGenericRelations(organization) {
    const { content } = await this.store.request(
      query('membership', {
        'filter[:or:][member][:id:]': organization.id,
        'filter[:or:][organization][:id:]': organization.id,
        'filter[role][:id:]': MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
        page: { size: 1, number: 0 },
      }),
    );
    return content.length > 0;
  }
}
