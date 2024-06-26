/**
 * Return the roles of the membership relations between the two provided
 * organizations.
 * @param {{@link OrganizationModel}} organization - The organization whose page
 *     the user is visiting.
 * @param {{@link OrganizationModel}} relatedOrganization - The organization for
 *     which the membership relations with the other argument should be
 *     retrieved.
 * @returns {string[]} An array containing the labels of all membership
 *    relations in the reading direction from organization to
 *    relatedOrganization.
 */
export default function getMembershipsRoleLabels(
  organization,
  relatedOrganization
) {
  const labels = [];

  organization
    .hasMany('memberships')
    .value()
    ?.forEach((membership) => {
      if (
        membership.organization.id === organization.id &&
        membership.member.id === relatedOrganization.id
      ) {
        const label = membership.role.get('inverseOpLabel');
        labels.push(label);
      }
    });

  organization
    .hasMany('membershipsOfOrganizations')
    .value()
    ?.forEach((membership) => {
      if (
        membership.member.id === organization.id &&
        membership.organization.id === relatedOrganization.id
      ) {
        const label = membership.role.get('opLabel');
        labels.push(label);
      }
    });

  return labels;
}
