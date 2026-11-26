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

    // Wait for the classification instead of reading what is loaded: the
    // backend does not send the one of a representative body along with the
    // organization.
    const classificationId = (await organization.classification)?.id;

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
    //
    // Non-worship types no longer get the generic "has a relation with" role.
    // Their stored relations with it are not shown (see `isHiddenRelation`),
    // so its label is not offered as a filter either.
    const storedRoleLabels = [];

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
        await this.#hasStoredRelationsWithRole(organization, governmentRole.id)
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
   * Whether the organization has stored memberships with the given role in
   * which it is the `organization`.
   */
  async #hasStoredRelationsWithRole(organization, roleId) {
    const { content } = await this.store.request(
      query('membership', {
        'filter[organization][:id:]': organization.id,
        'filter[role][:id:]': roleId,
        page: { size: 1, number: 0 },
      }),
    );
    return content.length > 0;
  }
}
