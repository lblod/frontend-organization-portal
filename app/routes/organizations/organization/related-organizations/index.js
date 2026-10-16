import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { query } from '@warp-drive/legacy/compat/builders';
import { ORGANIZATION_STATUS } from '../../../../models/organization-status-code';
import { getRelationStatus } from 'frontend-organization-portal/utils/relation-status';
import { sortRelatedOrganizations } from 'frontend-organization-portal/utils/sort-related-organizations';
import { SPECIAL_RELATED_ORGANIZATION_IDS } from 'frontend-organization-portal/constants/special-organizations';

export default class OrganizationsOrganizationRelatedOrganizationsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    organizationStatus: { refreshModel: true, replace: true },
    selectedRoleLabel: { refreshModel: true, replace: true },
  };

  /**
   * Get the model for the role with the given label.
   * @param {string} roleLabel - A role label.
   * @param {{@link MembershipRoleModel}[]} roles - The possible roles.
   * @returns {{@link MembershipRoleModel}[]} The model for the membership role
   *     matching the specified label, `undefined` if no such role was found.
   */
  getRoleModel(roleLabel, roles) {
    return roles.find(
      (r) => r.opLabel === roleLabel || r.inverseOpLabel === roleLabel,
    );
  }

  /**
   * Construct a query to retrieve memberships involving a specified
   * organization.
   * @param {string} organizationId - The UUID of the organization for which to
   *     the memberships should be queried.
   * @param {*} matchMemberRelation - If truthy query for memberships in which
   *     the the specified organization acts as member.
   * @param {Object} params - Any additional query parameters.
   * @param {{@link MembershipRoleModel}} [roleModel] - The model of the
   *     selected membership role.
   * @returns {Object} An object that can be use as query.
   */
  constructMembershipQuery(
    organizationId,
    matchMemberRelation,
    params,
    roleModel,
  ) {
    const thisSide = matchMemberRelation ? 'member' : 'organization';
    const otherSide = matchMemberRelation ? 'organization' : 'member';

    return {
      [`filter[${thisSide}][:id:]`]: organizationId,
      'filter[role][:id:]': roleModel ? roleModel.id : undefined,
      [`filter[${otherSide}][organization-status][:id:]`]:
        params.organizationStatus ? ORGANIZATION_STATUS.ACTIVE : undefined,
      include: [
        'role',
        'during',
        `${otherSide}.classification`,
        `${otherSide}.organization-status`,
      ].join(),
      page: { size: params.size, number: params.page },
    };
  }

  async model(params) {
    // Note: We use queries instead of following the membership relations in
    // `organization`. This allows us to offload the role and inactive filtering
    // to the backend instead of doing these in the frontend.

    const { organization, roles, selectableRoles, selectableRoleLabels } =
      this.modelFor('organizations.organization.related-organizations');

    const selectedRoleModel = this.getRoleModel(
      params.selectedRoleLabel,
      roles,
    );

    // If the user has not selected a role or selected the general "Has a
    // relationship with" role we need to retrieve all memberships where the
    // current `organization` is involved as a member or organization. Otherwise
    // the memberships to retrieve depends on the "direction" of the selected
    // role.
    const mustExecuteBothQueries =
      !selectedRoleModel || selectedRoleModel.hasRelationWith;

    let membershipsOfOrganizations = [];
    let memberships = [];

    if (
      mustExecuteBothQueries ||
      params.selectedRoleLabel === selectedRoleModel.opLabel
    ) {
      membershipsOfOrganizations = (
        await this.store.request(
          query(
            'membership',
            this.constructMembershipQuery(
              organization.id,
              true,
              params,
              selectedRoleModel,
            ),
          ),
        )
      ).content;
    }

    if (
      mustExecuteBothQueries ||
      params.selectedRoleLabel === selectedRoleModel.inverseOpLabel
    ) {
      memberships = (
        await this.store.request(
          query(
            'membership',
            this.constructMembershipQuery(
              organization.id,
              false,
              params,
              selectedRoleModel,
            ),
          ),
        )
      ).content;
    }

    // Process the memberships retrieved from the backend since we need to
    // determined which involved organization display.
    let relatedOrganizations = [];

    // The status of the current organization is loaded by the parent route,
    // the one of the related organizations is included in the queries above.
    const organizationStatus = await organization.organizationStatus;

    for (const membership of membershipsOfOrganizations) {
      const relatedOrganization = await membership.organization;
      const relatedStatus = await relatedOrganization.organizationStatus;
      const role = await membership.role;
      const classification = await relatedOrganization.classification;

      relatedOrganizations.push({
        role: role.opLabel,
        organizationType: classification.label,
        organizationId: relatedOrganization.id,
        organizationName: relatedOrganization.abbName,
        organizationStatus: relatedStatus,
        // The special organizations have no detail page, so they must not be
        // linked to in the view table.
        isSpecialOrganization: SPECIAL_RELATED_ORGANIZATION_IDS.includes(
          relatedOrganization.id,
        ),
        startDate: membership.during?.startDate,
        endDate: membership.during?.endDate,
        relationStatus: getRelationStatus({
          endDate: membership.during?.endDate,
          memberStatusId: organizationStatus?.id,
          organizationStatusId: relatedStatus?.id,
        }),
      });
    }

    for (const membership of memberships) {
      const member = await membership.member;
      const memberStatus = await member.organizationStatus;
      const role = await membership.role;
      const classification = await member.classification;

      relatedOrganizations.push({
        role: role.inverseOpLabel,
        organizationType: classification.label,
        organizationId: member.id,
        organizationName: member.abbName,
        organizationStatus: memberStatus,
        isSpecialOrganization: SPECIAL_RELATED_ORGANIZATION_IDS.includes(
          member.id,
        ),
        startDate: membership.during?.startDate,
        endDate: membership.during?.endDate,
        relationStatus: getRelationStatus({
          endDate: membership.during?.endDate,
          memberStatusId: memberStatus?.id,
          organizationStatusId: organizationStatus?.id,
        }),
      });
    }

    // We have sort manually instead of in the backend because it depends on the
    // direction of membership whether to use the member or organization value
    // for sorting.
    if (params.sort) {
      relatedOrganizations = sortRelatedOrganizations(
        relatedOrganizations,
        params.sort,
      );
    }

    return {
      organization,
      relatedOrganizations,
      roles,
      selectableRoles,
      selectableRoleLabels,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
