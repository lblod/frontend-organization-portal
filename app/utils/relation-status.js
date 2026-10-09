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
 * Whether a relation with the given end date has ended. Only an end date
 * before today ends it, a future end date keeps it active.
 */
export function isRelationEnded(endDate) {
  if (!endDate) {
    return false;
  }
  return toIsoDate(endDate) < toIsoDate(new Date());
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

// Local calendar date, the same convention as the date transform
function toIsoDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
