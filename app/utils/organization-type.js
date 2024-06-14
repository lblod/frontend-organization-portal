import { CLASSIFICATION } from '../models/administrative-unit-classification-code';

/**
 * Get a set of organization types that match the give classification code
 * identifiers. The result contains each relevant organization type exactly
 * once.
 *
 * @param {...string} classificationCodeIds - the identifiers to match to the
 *     corresponding organization type.
 * @returns {string[]} The matching organization codes.
 */
export function getOrganizationTypes(...classificationCodeIds) {
  const organizationTypes = Object.values(CLASSIFICATION)
    .filter((cl) => classificationCodeIds.includes(cl.id))
    .map((cl) => cl.organizationType);

  return Array.from(new Set(organizationTypes));
}

/**
 * Get the organization code matching a given classification code identifier.
 *
 * @param {string} classificationCodeId - a classification code identifier.
 * @returns {string} The matching organization type, if one exists.
 */
export function getOrganizationType(classificationCodeId) {
  let result = getOrganizationTypes(classificationCodeId);
  if (result.length === 1) {
    return result[0];
  }
}
