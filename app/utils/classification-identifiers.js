import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { ORGANIZATION_TYPES } from '../constants/organization-types';

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
  let ids = Object.values(CLASSIFICATION).map(
    (classification) => classification.id
  );

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

  // Remove all falsy elements before using array
  organizationTypes = organizationTypes?.filter((elem) => !!elem);

  if (organizationTypes?.length > 0) {
    if (!organizationTypes.includes(ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT)) {
      ids = ids.filter((id) =>
        [
          CLASSIFICATION.ZIEKENHUISVERENIGING.id,
          CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
            .id,
          CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ].includes(id)
      );
    }

    if (!organizationTypes.includes(ORGANIZATION_TYPES.ASSOCIATION)) {
      ids = ids.filter(
        (id) =>
          ![
            CLASSIFICATION.ZIEKENHUISVERENIGING.id,
            CLASSIFICATION
              .VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
            CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
            CLASSIFICATION.ASSOCIATION_OTHER.id,
          ].includes(id)
      );
    }

    if (!organizationTypes.includes(ORGANIZATION_TYPES.CORPORATION)) {
      ids = ids.filter((id) => id !== CLASSIFICATION.CORPORATION_OTHER.id);
    }
  }

  if (hasWorshipRole) {
    ids = ids.filter((id) => worshipClassifications.includes(id));
  } else {
    ids = ids.filter((id) => !worshipClassifications.includes(id));
  }

  if (restrictForCreation) {
    ids = ids.filter((id) => !uncreateableClassifications.includes(id));
  }

  return ids;
}
