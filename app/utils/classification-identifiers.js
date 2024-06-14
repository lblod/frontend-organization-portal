import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export function selectByRole(hasWorshipRole) {
  return getClassificationIdsForRole(hasWorshipRole).join(', ');
}

/**
 * Retrieve a list of classification code identifiers that are valid for a user
 * with the given role, and optionally restricted for organisations for which
 * new ones can be created by the users.
 *
 * @param {*} hasWorshipRole - a truthy value indicates the current user has a
 *     worship role, otherwise a non-worship user is assumed.
 * @param {*} restrictForCreation - if thruthy restrict the result to those
 *     classification codes for which new organizations can be created by the
 *     user.
 * @returns {string[]} A list containing the appropriate classification code
 *     identifiers.
 */
export function getClassificationIdsForRole(
  hasWorshipRole,
  restrictForCreation
) {
  let ids = [];

  if (hasWorshipRole) {
    ids = [
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
      CLASSIFICATION.WORSHIP_SERVICE.id,
      CLASSIFICATION.REPRESENTATIVE_BODY.id,
    ];
  } else {
    ids = [
      CLASSIFICATION.AGB.id,
      CLASSIFICATION.APB.id,
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.PROVINCE.id,
      CLASSIFICATION.OCMW.id,
      CLASSIFICATION.DISTRICT.id,
      CLASSIFICATION.PROJECTVERENIGING.id,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
      CLASSIFICATION.POLICE_ZONE.id,
      CLASSIFICATION.ASSISTANCE_ZONE.id,
      CLASSIFICATION.WELZIJNSVERENIGING.id,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
      CLASSIFICATION.PEVA_MUNICIPALITY.id,
      CLASSIFICATION.PEVA_PROVINCE.id,
      CLASSIFICATION.ZIEKENHUISVERENIGING.id,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ];
  }

  if (restrictForCreation) {
    ids = ids.filter(
      (id) =>
        ![
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.PROVINCE.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.REPRESENTATIVE_BODY.id,
        ].includes(id)
    );
  }
  return ids;
}
