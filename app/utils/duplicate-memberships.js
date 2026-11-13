import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { periodsOverlap } from 'frontend-organization-portal/utils/period-of-time';

/**
 * Whether two memberships describe the same relation: the same role between
 * the same two organizations. A membership whose role or organizations are not
 * picked yet describes no relation. The "has a relation with" role has no
 * direction for the user, so its memberships also match with the sides
 * swapped.
 *
 * Compares the loaded records rather than ids: the edit page loads every side
 * of the memberships it shows, and an organization that is picked is loaded
 * as well.
 */
export function isSameRelation(membership, other) {
  const role = roleOf(membership);
  const member = memberOf(membership);
  const organization = organizationOf(membership);
  if (!role || !member || !organization || roleOf(other) !== role) {
    return false;
  }

  const otherMember = memberOf(other);
  const otherOrganization = organizationOf(other);
  return (
    (otherMember === member && otherOrganization === organization) ||
    (role.hasRelationWith &&
      otherMember === organization &&
      otherOrganization === member)
  );
}

/**
 * Whether storing `membership` next to `other` stores the same relation twice.
 * The same relation may be stored more than once only for periods that cannot
 * be active at the same time, so the periods must not overlap. The relations
 * of an organization that is not active are never active whatever their
 * period, so repeating one of those is always a duplicate.
 */
export function isDuplicateMembership(membership, other) {
  if (membership === other || !isSameRelation(membership, other)) {
    return false;
  }
  if (!isActive(memberOf(other)) || !isActive(organizationOf(other))) {
    return true;
  }
  return periodsOverlap(membership.during, other.during);
}

/**
 * The membership before `membership` in `memberships` that it duplicates, if
 * any. Memberships that are being removed no longer count. Only the earlier
 * memberships are considered so that of two identical new rows the first is
 * stored and the second is the duplicate.
 */
export function findDuplicatedMembership(membership, memberships) {
  const index = memberships.indexOf(membership);
  const earlier = index === -1 ? memberships : memberships.slice(0, index);
  return earlier.find(
    (other) => !other.isDeleted && isDuplicateMembership(membership, other),
  );
}

function roleOf(membership) {
  return membership.belongsTo('role').value();
}

function memberOf(membership) {
  return membership.belongsTo('member').value();
}

function organizationOf(membership) {
  return membership.belongsTo('organization').value();
}

// In formation counts as active, as it does for the status of a relation
function isActive(organization) {
  return (
    organization?.belongsTo('organizationStatus').value()?.id !==
    ORGANIZATION_STATUS.INACTIVE
  );
}
