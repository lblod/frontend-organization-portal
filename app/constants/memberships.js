import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import {
  IGSCodeList,
  OcmwAssociationCodeList,
  PevaCodeList,
} from 'frontend-organization-portal/constants/Classification';

// Specifies which kinds of organisations can acts as participants in other
// organisations. For each classification code in an organisations property the
// classification codes for the allowed kinds of participants are listed in the
// members property.
const allowedParticipationMemberships = [
  {
    organizations: [...IGSCodeList],
    members: [
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.OCMW.id,
      CLASSIFICATION.AGB.id,
      CLASSIFICATION.PROJECTVERENIGING.id,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
      CLASSIFICATION.POLICE_ZONE.id,
      CLASSIFICATION.ASSISTANCE_ZONE.id,
      CLASSIFICATION.PEVA_MUNICIPALITY.id,
      CLASSIFICATION.PEVA_PROVINCE.id,
      CLASSIFICATION.WELZIJNSVERENIGING.id,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
      CLASSIFICATION.ZIEKENHUISVERENIGING.id,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ],
  },
  {
    organizations: [...OcmwAssociationCodeList],
    members: [
      ...OcmwAssociationCodeList,
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.OCMW.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ],
  },
  {
    organizations: [...PevaCodeList],
    members: [...IGSCodeList],
  },
];

const allowedfoundingMemberships = [
  {
    organizations: [CLASSIFICATION.AGB.id],
    members: [CLASSIFICATION.MUNICIPALITY.id],
  },
  {
    organizations: [CLASSIFICATION.APB.id],
    members: [CLASSIFICATION.MUNICIPALITY.id],
  },
  {
    organizations: [CLASSIFICATION.PEVA_MUNICIPALITY.id],
    members: [
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ],
  },
  {
    organizations: [CLASSIFICATION.PEVA_PROVINCE.id],
    members: [
      CLASSIFICATION.PROVINCE.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ],
  },
  {
    organizations: [...OcmwAssociationCodeList],
    members: [
      ...OcmwAssociationCodeList,
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.OCMW.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ],
  },
];

const allowedMembershipRelations = new Map([
  [
    MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
    allowedParticipationMemberships,
  ],
  [MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id, allowedfoundingMemberships],
]);

/**
 * Get the list of organization's classification codes which can have the given
 * membership relation with this provided organization. The direction of the
 * membership relation is determined based on whether the provided organization
 * acts as member or organization in the provided membership.
 * @param {{@link MembershipModel}} membership - The membership for which to
 *     determine the appropriate classification codes.
 * @param {{@link OrganizationModel}} organization - The organization that is
 *     involved in the provided membership.
 * @returns {[string]} A list of classifications codes specifying the kinds of
 *     organizations that are allowed to act as the other organization in the
 *     membership with this organization. If this organization is not involved
 *     in the provided membership, the result is an empty list.
 */
export default function getOppositeClassifications(membership, organization) {
  let membershipRoleMap = allowedMembershipRelations.get(membership.role.id);

  if (membershipRoleMap && organization) {
    if (membership.member.id === organization.id) {
      return membershipRoleMap
        .filter((e) => e.members.includes(organization.classification.id))
        .flatMap((e) => e.organizations);
    }
    if (membership.organization.id === organization.id) {
      return membershipRoleMap
        .filter((e) => e.organizations.includes(organization.classification.id))
        .flatMap((e) => e.members);
    }
  }

  return [];
}
