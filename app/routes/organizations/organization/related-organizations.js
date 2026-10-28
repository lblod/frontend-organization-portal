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
  sortRoleLabels,
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

    const classificationId = organization.classification?.get('id');

    // Only offer the roles the rules allow for the classification.
    const selectableRoles = roles.filter((role) =>
      allowedRolesForClassification(classificationId).some(
        (selectableRole) => selectableRole.id === role.id,
      ),
    );

    // Labels the edit page offers for new relations, including direction.
    const allowedRoleLabels =
      allowedRoleLabelsForClassification(classificationId);

    // Labels the rules exclude. Only added if the organization already has
    // relations with them, so they stay filterable.
    const storedRoleLabels = [];

    // Non-worship types no longer get the generic "has a relation with" role,
    // but existing relations with it must stay filterable.
    if (
      !selectableRoles.some((role) => role.hasRelationWith) &&
      (await this.#hasStoredRelationsWithRole(
        organization,
        MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
      ))
    ) {
      storedRoleLabels.push(MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.label);
    }

    // The rules exclude the founder and recognition roles because they're
    // autofilled for some types. Show "Is opgericht door" and
    // "Is erkend door" only if the organization has stored relations with them.
    for (const governmentRole of [
      MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO,
    ]) {
      if (selectableRoles.some((role) => role.id === governmentRole.id)) {
        continue;
      }
      if (
        await this.#hasStoredRelationsWithRole(
          organization,
          governmentRole.id,
          'organization',
        )
      ) {
        storedRoleLabels.push(governmentRole.inverseLabel);
      }
    }

    // Labels for the role filters above the view and edit tables.
    const selectableRoleLabels = sortRoleLabels([
      ...new Set([...allowedRoleLabels, ...storedRoleLabels]),
    ]);

    return {
      organization,
      roles,
      selectableRoles,
      selectableRoleLabels,
      allowedRoleLabels,
    };
  }

  /**
   * Whether the organization has stored memberships with the given role,
   * either as their member or as their organization. Pass a relation to
   * only check the memberships on that side of the organization.
   */
  async #hasStoredRelationsWithRole(organization, roleId, relation) {
    const organizationFilters = relation
      ? { [`filter[${relation}][:id:]`]: organization.id }
      : {
          'filter[:or:][member][:id:]': organization.id,
          'filter[:or:][organization][:id:]': organization.id,
        };
    const { content } = await this.store.request(
      query('membership', {
        ...organizationFilters,
        'filter[role][:id:]': roleId,
        page: { size: 1, number: 0 },
      }),
    );
    return content.length > 0;
  }
}
