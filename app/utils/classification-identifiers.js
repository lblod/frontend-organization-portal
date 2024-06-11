import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

/**
 * Retrieve a list of classification code that are valid for a user with the
 * given role, and optionally restricted for organisations for which new ones
 * can be created by the users. Zero or more organization types can be provided
 * to limit the result to the classification code identifiers of these types.
 *
 * @param {*} hasWorshipRole - a truthy value indicates the current user has a
 *     worship role, otherwise a non-worship user is assumed.
 * @param {*} restrictForCreation - if thruthy restrict the result to those
 *     classification codes for which new organizations can be created by the
 *     user.
 * @param {...ORGANIZATION_TYPES} organizationTypes - an optional set of
 *     organization types
 * @returns {object[]} A list containing the appropriate classification code
 *     identifiers.
 */
function getClassificationCodes(
  hasWorshipRole,
  restrictForCreation,
  ...organizationTypes
) {
  let classifications = Object.values(CLASSIFICATION);

  // Remove all falsy elements before using array
  organizationTypes = organizationTypes?.filter((elem) => !!elem);

  if (organizationTypes?.length > 0) {
    classifications = classifications.filter((classification) =>
      organizationTypes.includes(classification.organizationType)
    );
  }

  const worshipClassifications = [
    CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
    CLASSIFICATION.WORSHIP_SERVICE.id,
    CLASSIFICATION.REPRESENTATIVE_BODY.id,
  ];

  const uncreateableClassifications = [
    CLASSIFICATION.MUNICIPALITY.id,
    CLASSIFICATION.PROVINCE.id,
    CLASSIFICATION.OCMW.id,
    CLASSIFICATION.REPRESENTATIVE_BODY.id,
  ];

  if (hasWorshipRole) {
    classifications = classifications.filter((classification) =>
      worshipClassifications.includes(classification.id)
    );
  } else {
    classifications = classifications.filter(
      (classification) => !worshipClassifications.includes(classification.id)
    );
  }

  if (restrictForCreation) {
    classifications = classifications.filter(
      (classification) =>
        !uncreateableClassifications.includes(classification.id)
    );
  }

  return classifications;
}

/**
 * Retrieve a list of classification code identifiers that are valid for a user
 * with the given role, and optionally restricted for organisations for which
 * new ones can be created by the users. Zero or more organization types can be
 * provided to limit the result to the classification code identifiers of these
 * types.
 *
 * @param {*} hasWorshipRole - a truthy value indicates the current user has a
 *     worship role, otherwise a non-worship user is assumed.
 * @param {*} restrictForCreation - if thruthy restrict the result to those
 *     classification codes for which new organizations can be created by the
 *     user.
 * @param {...ORGANIZATION_TYPES} organizationTypes - an optional set of
 *     organization types
 * @returns {string[]} A list containing the appropriate classification code
 *     identifiers.
 */
export function getClassificationIdsForRole(
  hasWorshipRole,
  restrictForCreation,
  ...organizationTypes
) {
  return getClassificationCodes(
    hasWorshipRole,
    restrictForCreation,
    ...organizationTypes
  ).map((classification) => classification.id);
}

/**
 * Retrieve string containing all classification code identifiers valid for a
 * user. The different identifiers are separated by a comma and a space.
 *
 * @param {*} hasWorshipRole - a truthy value indicates the current user has a
 *     worship role, otherwise a non-worship user is assumed.
 * @returns {string} A string containing all applicable identifiers separated by
 *     a comma and space.
 */
export function selectByRole(hasWorshipRole) {
  return getClassificationIdsForRole(hasWorshipRole).join(', ');
}
