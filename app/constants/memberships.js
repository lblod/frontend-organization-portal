import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import {
  AgbCodeList,
  AndereCodeList,
  ApbCodeList,
  AssistanceZoneCodeList,
  CentralWorshipServiceCodeList,
  DistrictCodeList,
  IGSCodeList,
  MunicipalityCodeList,
  NonWorshipCodeList,
  OcmwAssociationCodeList,
  OCMWCodeList,
  PevaCodeList,
  PevaMunicipalityCodeList,
  PevaProvinceCodeList,
  PoliceZoneCodeList,
  ProvinceCodeList,
  RepresentativeBodyCodeList,
  WorshipServiceCodeList,
} from 'frontend-organization-portal/constants/classification';

// Specifies which organization classifications are allowed as participants in
// other organization classifications. For each classification code in an
// `organizations` property the classification codes for the allowed kinds of
// participants are listed in the `members` property.
//
// For example,
// ```
// {
//   organizations: [...AgbCodeList],
//   members: [...MunicipalityCodeList],
// }
// ```
// means "an AGB can have as participant a municipality" as well as the inverse
// relation "a municipality can participate in an AGB".
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
      ...AndereCodeList,
    ],
  },
  {
    organizations: [...OcmwAssociationCodeList],
    members: [
      ...OcmwAssociationCodeList,
      ...MunicipalityCodeList,
      ...OCMWCodeList,
      ...AndereCodeList,
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
  {
    organizations: [...PoliceZoneCodeList, ...AssistanceZoneCodeList],
    members: [...MunicipalityCodeList],
  },
];

// Same as above but for founding relationships between organizations.
// ```
// {
//   organizations: [...AgbCodeList],
//   members: [...MunicipalityCodeList],
// },
// ```
// means "an AGB can have as founding organisation a municipality" and "a
// municipality can found an AGB".
export const allowedFoundingMemberships = [
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
    members: [...MunicipalityCodeList, ...AndereCodeList],
  },
  {
    organizations: [...PevaProvinceCodeList],
    members: [...ProvinceCodeList, ...AndereCodeList],
  },
  {
    organizations: [...OcmwAssociationCodeList],
    members: [
      ...OcmwAssociationCodeList,
      ...MunicipalityCodeList,
      ...OCMWCodeList,
      ...AndereCodeList,
    ],
  },
];

// Similar as above but for "has a relationship" memberships between
// organizations. Note, from a user standpoint this kind of membership has no
// direction. More concretely, for a user the following would be identical:
// - "A has a relationship with B"; and
// - "B has a relationship with A".
//
// We do enforce a specific direction, i.e. assignment of `organization` and
// `member`, when storing memberships to ensure data consistency. This direction
// is defined by the data structure below. The `getOppositeClassifications`
// function takes care of presenting the user with the right options.
export const allowedHasRelationWithMemberships = [
  {
    organizations: [...MunicipalityCodeList],
    members: [
      ...OCMWCodeList,
      ...DistrictCodeList,
      ...AgbCodeList,
      ...ApbCodeList,
      ...IGSCodeList,
      ...PoliceZoneCodeList,
      ...AssistanceZoneCodeList,
      ...PevaMunicipalityCodeList,
    ],
  },
  {
    organizations: [...ProvinceCodeList],
    members: [
      ...MunicipalityCodeList,
      ...OCMWCodeList,
      ...ApbCodeList,
      ...AgbCodeList,
      ...PoliceZoneCodeList,
      ...AssistanceZoneCodeList,
      ...PevaCodeList,
    ],
  },
  {
    organizations: [...CentralWorshipServiceCodeList],
    members: [...WorshipServiceCodeList, ...RepresentativeBodyCodeList],
  },
  {
    organizations: [...WorshipServiceCodeList],
    members: [...RepresentativeBodyCodeList],
  },
];

// Same as above for "serves" memberships: "a municipality is served by an
// OCMW" and "an OCMW serves a municipality".
export const allowedServingMemberships = [
  {
    organizations: [...MunicipalityCodeList],
    members: [...OCMWCodeList],
  },
];

// Same as above for "grants recognition to" memberships: "an organization was
// recognised by a member organization" and "a member organization grants
// recognition to an organization". Allowed between all non-worship
// organizations until the business narrows it down.
export const allowedRecognitionMemberships = [
  {
    organizations: [...NonWorshipCodeList],
    members: [...NonWorshipCodeList],
  },
];

// Same as above for "is actually represented in (no membership)" memberships:
// "an organization has a member organization as actual representative" and "a
// member organization is actually represented in an organization". Allowed
// between all non-worship organizations until the business narrows it down.
export const allowedRepresentationMemberships = [
  {
    organizations: [...NonWorshipCodeList],
    members: [...NonWorshipCodeList],
  },
];

/**
 * Check whether the organization assignments in the given membership should be
 * swapped in order become a valid "has a relation with" membership.
 * The result of this function is only meaningful when applied to a membership
 * - with the "has a relation with" role; and
 * - there is an assignment of the involved organizations which constitutes a
 *   relation according to {@link allowedHasRelationWithMemberships}.
 * If either of these conditions is not satisfied, the result of this function
 * should not be used.
 * @param {{@link MembershipModel}} membership - the membership to be checked
 * @returns {boolean} True if the `member` and `organization` should be
 *     swapped, false otherwise.
 */
export function shouldSwapAssignments(membership) {
  const organizationClass = membership.organization
    .get('classification')
    .get('id');
  const memberClass = membership.member.get('classification').get('id');

  return allowedHasRelationWithMemberships.some(
    (elem) =>
      elem.organizations.includes(memberClass) &&
      elem.members.includes(organizationClass),
  );
}

const allowedMembershipRelations = new Map([
  [
    MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
    allowedParticipationMemberships,
  ],
  [MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id, allowedFoundingMemberships],
  [
    MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
    allowedHasRelationWithMemberships,
  ],
  [MEMBERSHIP_ROLES_MAPPING.SERVES.id, allowedServingMemberships],
  [
    MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO.id,
    allowedRecognitionMemberships,
  ],
  [
    MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN.id,
    allowedRepresentationMemberships,
  ],
]);

/**
 * Get the list of organization classification codes that are allowed to be
 * involved in the given membership and organization. For most membership roles
 * the direction of the membership relation is determined based on whether the
 * provided organization acts as `member` or `organization` in the provided
 * membership.
 * The exception is the HAS_RELATION_WITH role were all possibilities are
 * returned irrelevant of whether the provided organization acts as `member` or
 * `organization`.
 *
 * @param {{@link MembershipModel}} membership - The membership for which to
 *     determine the appropriate classification codes.
 * @param {{@link OrganizationModel}} organization - The organization that is
 *     involved in the provided membership.
 * @returns {[string]} A list of classification codes specifying the kinds of
 *     organizations that are allowed to act as the other organization in the
 *     membership with the provided one. An empty list if the provided
 *     membership has no role or if the provided organization is not involved
 *     in the provided membership.
 */
export default function getOppositeClassifications(membership, organization) {
  const membershipRoleMap =
    allowedMembershipRelations.get(membership.role.id) || [];

  if (membershipRoleMap && organization) {
    const members = membershipRoleMap
      .filter((e) => e.organizations.includes(organization.classification.id))
      .flatMap((e) => e.members);
    const organizations = membershipRoleMap
      .filter((e) => e.members.includes(organization.classification.id))
      .flatMap((e) => e.organizations);

    if (membership.role.id === MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id) {
      return [...new Set([...members, ...organizations])];
    } else {
      if (membership.member.id === organization.id) {
        return organizations;
      }
      if (membership.organization.id === organization.id) {
        return members;
      }
    }
  }

  return [];
}
