import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ORGANIZATION_STATUS } from '../../../../models/organization-status-code';

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
    return {
      [`filter[${matchMemberRelation ? 'member' : 'organization'}][:id:]`]:
        organizationId,
      'filter[role][:id:]': roleModel ? roleModel.id : undefined,
      [`filter[${
        matchMemberRelation ? 'organization' : 'member'
      }][organization-status][:id:]`]: params.organizationStatus
        ? ORGANIZATION_STATUS.ACTIVE
        : undefined,
      include: `role,${
        matchMemberRelation ? 'organization,organization' : 'member,member'
      }.classification`,
      page: { size: params.size, number: params.page },
    };
  }

  async model(params) {
    // Note: We use queries instead of following the membership relations in
    // `organization`. This allows us to offload the role and inactive filtering
    // to the backend instead of doing these in the frontend.

    const { organization, roles } = this.modelFor(
      'organizations.organization.related-organizations',
    );

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
      membershipsOfOrganizations = await this.store.query(
        'membership',
        this.constructMembershipQuery(
          organization.id,
          true,
          params,
          selectedRoleModel,
        ),
      );
    }

    if (
      mustExecuteBothQueries ||
      params.selectedRoleLabel === selectedRoleModel.inverseOpLabel
    ) {
      memberships = await this.store.query(
        'membership',
        this.constructMembershipQuery(
          organization.id,
          false,
          params,
          selectedRoleModel,
        ),
      );
    }

    // Process the memberships retrieved from the backend since we need to
    // determined which involved organization display.
    let relatedOrganizations = [];

    for (const membership of membershipsOfOrganizations) {
      const organization = await membership.organization;
      const role = await membership.role;
      const classification = await organization.classification;

      relatedOrganizations.push({
        role: role.get('opLabel'),
        organizationType: classification.get('label'),
        organizationId: organization.id,
        organizationName: organization.get('abbName'),
        organizationStatus: organization.get('organizationStatus'),
      });
    }

    for (const membership of memberships) {
      const member = await membership.member;
      const role = await membership.role;
      const classification = await member.classification;

      relatedOrganizations.push({
        role: role.get('inverseOpLabel'),
        organizationType: classification.get('label'),
        organizationId: member.id,
        organizationName: member.get('abbName'),
        organizationStatus: member.get('organizationStatus'),
      });
    }

    // We have sort manually instead of in the backend because it depends on the
    // direction of membership whether to use the member or organization value
    // for sorting.
    if (params.sort.length) {
      // [table column, attribute to sort on]
      const sortOptions = new Map([
        ['name', 'organizationName'],
        ['classification.label', 'organizationType'],
        ['role.label', 'role'],
      ]);

      if (params.sort.startsWith('-')) {
        relatedOrganizations = relatedOrganizations.sort((a, b) => {
          const attributeName = sortOptions.get(params.sort.slice(1));
          return b[attributeName].localeCompare(a[attributeName]);
        });
      } else {
        relatedOrganizations = relatedOrganizations.sort((a, b) => {
          const attributeName = sortOptions.get(params.sort);
          return a[attributeName].localeCompare(b[attributeName]);
        });
      }
    }

    return {
      organization,
      relatedOrganizations,
      roles,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
