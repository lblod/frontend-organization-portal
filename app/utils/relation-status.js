import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';

// The statuses of a relation reuse the organization status ids so the
// OrganizationStatus component can display them
export const RELATION_STATUS = Object.freeze({
  ACTIVE: Object.freeze({ id: ORGANIZATION_STATUS.ACTIVE, label: 'Actief' }),
  INACTIVE: Object.freeze({
    id: ORGANIZATION_STATUS.INACTIVE,
    label: 'Niet actief',
  }),
});

/**
 * Whether a relation with the given end date has ended. The end date is a
 * day: the relation is still active on that day, so compare with the start of
 * today rather than with the current time.
 */
export function isRelationEnded(endDate) {
  if (!endDate) {
    return false;
  }
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return endDate < startOfToday;
}

/**
 * The status of a relation is derived, never stored: not active once the
 * relation has ended or when one of the organizations is not active.
 */
export function getRelationStatus({
  endDate,
  memberStatusId,
  organizationStatusId,
}) {
  if (
    isRelationEnded(endDate) ||
    memberStatusId === ORGANIZATION_STATUS.INACTIVE ||
    organizationStatusId === ORGANIZATION_STATUS.INACTIVE
  ) {
    return RELATION_STATUS.INACTIVE;
  }

  return RELATION_STATUS.ACTIVE;
}
