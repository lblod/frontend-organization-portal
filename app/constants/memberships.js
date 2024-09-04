import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import {
  IGSCodeList,
  OcmwAssociationCodeList,
  PevaCodeList,
} from 'frontend-organization-portal/constants/Classification';
import {
  AgbCodeList,
  ApbCodeList,
  AssistanceZoneCodeList,
  AssociationOtherCodeList,
  CentralWorshipServiceCodeList,
  CorporationOtherCodeList,
  MunicipalityCodeList,
  OCMWCodeList,
  PevaMunicipalityCodeList,
  PevaProvinceCodeList,
  PoliceZoneCodeList,
  ProvinceCodeList,
  RepresentativeBodyCodeList,
  WorshipServiceCodeList,
} from './Classification';

// Specifies which kinds of organisations can acts as participants in other
// organisations. For each classification code in an organisations property the
// classification codes for the allowed kinds of participants are listed in the
// members property.
export const allowedParticipationMemberships = [
  {
    organizations: [...IGSCodeList],
    members: [
      ...MunicipalityCodeList,
      ...OCMWCodeList,
      ...AgbCodeList,
      ...IGSCodeList,
      ...PoliceZoneCodeList,
      ...AssistanceZoneCodeList,
      ...PevaCodeList,
      ...OcmwAssociationCodeList,
      ...AssociationOtherCodeList,
      ...CorporationOtherCodeList,
    ],
  },
  {
    organizations: [...OcmwAssociationCodeList],
    members: [
      ...OcmwAssociationCodeList,
      ...MunicipalityCodeList,
      ...OCMWCodeList,
      ...AssociationOtherCodeList,
      ...CorporationOtherCodeList,
    ],
  },
  {
    organizations: [...PevaCodeList],
    members: [...IGSCodeList],
  },
  {
    organizations: [...AgbCodeList],
    members: [...MunicipalityCodeList],
  },
  {
    organizations: [...ApbCodeList],
    members: [...ProvinceCodeList],
  },
];

export const allowedfoundingMemberships = [
  {
    organizations: [...AgbCodeList],
    members: [...MunicipalityCodeList],
  },
  {
    organizations: [...ApbCodeList],
    members: [...ProvinceCodeList],
  },
  {
    organizations: [...PevaMunicipalityCodeList],
    members: [
      ...MunicipalityCodeList,
      ...AssociationOtherCodeList,
      ...CorporationOtherCodeList,
    ],
  },
  {
    organizations: [...PevaProvinceCodeList],
    members: [
      ...ProvinceCodeList,
      ...AssociationOtherCodeList,
      ...CorporationOtherCodeList,
    ],
  },
  {
    organizations: [...OcmwAssociationCodeList],
    members: [
      ...OcmwAssociationCodeList,
      ...MunicipalityCodeList,
      ...OCMWCodeList,
      ...AssociationOtherCodeList,
      ...CorporationOtherCodeList,
    ],
  },
];

export const allowedHasRelationWithMemberships = [
  {
    organizations: [...MunicipalityCodeList],
    members: [
      ...AgbCodeList,
      ...IGSCodeList,
      ...PoliceZoneCodeList,
      ...AssistanceZoneCodeList,
    ],
  },
  {
    organizations: [...ProvinceCodeList],
    members: [
      ...ApbCodeList,
      ...MunicipalityCodeList,
      ...PevaProvinceCodeList,
      ...OCMWCodeList,
    ],
  },
  { organizations: [...AgbCodeList], members: [...ProvinceCodeList] },
  {
    organizations: [
      ...CentralWorshipServiceCodeList,
      ...RepresentativeBodyCodeList,
    ],
    members: [...WorshipServiceCodeList],
  },
  {
    organizations: [...WorshipServiceCodeList, ...RepresentativeBodyCodeList],
    members: [...CentralWorshipServiceCodeList],
  },
  {
    organizations: [
      ...WorshipServiceCodeList,
      ...CentralWorshipServiceCodeList,
    ],
    members: [...RepresentativeBodyCodeList],
  },
];

const allowedMembershipRelations = new Map([
  [
    MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
    allowedParticipationMemberships,
  ],
  [MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id, allowedfoundingMemberships],
  [
    MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
    allowedHasRelationWithMemberships,
  ],
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
