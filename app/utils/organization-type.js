import { ORGANIZATION_TYPES } from '../constants/organization-types';
import { CLASSIFICATION } from '../models/administrative-unit-classification-code';

const administrativeUnitClassificationIds = Object.values(CLASSIFICATION)
  .map((cl) => cl.id)
  .filter(
    (id) =>
      ![
        // Non administrative units
        CLASSIFICATION.ZIEKENHUISVERENIGING.id,
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
          .id,
        CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
        CLASSIFICATION.ASSOCIATION_OTHER.id,
        CLASSIFICATION.CORPORATION_OTHER.id,
      ].includes(id)
  );

const associationClassificationIds = [
  CLASSIFICATION.ZIEKENHUISVERENIGING.id,
  CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
  CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
  CLASSIFICATION.ASSOCIATION_OTHER.id,
];

const corporationClassificationIds = [CLASSIFICATION.CORPORATION_OTHER.id];

function intersectionNotEmpty(left, right) {
  return left.filter((elem) => right.includes(elem)).length > 0;
}

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
  const types = [];

  if (
    intersectionNotEmpty(
      classificationCodeIds,
      administrativeUnitClassificationIds
    )
  ) {
    types.push(ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT);
  }

  if (
    intersectionNotEmpty(classificationCodeIds, associationClassificationIds)
  ) {
    types.push(ORGANIZATION_TYPES.ASSOCIATION);
  }

  if (
    intersectionNotEmpty(classificationCodeIds, corporationClassificationIds)
  ) {
    types.push(ORGANIZATION_TYPES.CORPORATION);
  }

  return types;
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
