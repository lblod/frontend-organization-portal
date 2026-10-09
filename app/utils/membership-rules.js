import {
  allowedParticipationMemberships,
  allowedFoundingMemberships,
  allowedHasRelationWithMemberships,
  allowedServingMemberships,
  allowedRecognitionMemberships,
  allowedRepresentationMemberships,
  membershipFieldsByClassification,
} from 'frontend-organization-portal/constants/memberships';
import {
  MEMBERSHIP_ROLES,
  MEMBERSHIP_ROLES_MAPPING,
} from 'frontend-organization-portal/models/membership-role';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
 * The membership roles that may be used in relations with an organization of
 * the given classification, e.g. for the role selects on the
 * related-organizations pages.
 *
 * @param {string} classificationId - classification of the organization.
 * @returns {object[]} the entries of `MEMBERSHIP_ROLES` that may be used.
 */
export function allowedRolesForClassification(classificationId) {
  return MEMBERSHIP_ROLES.filter((role) => {
    const relations = allowedMembershipRelations.get(role.id) || [];
    return relations.some(
      (entry) =>
        entry.organizations.includes(classificationId) ||
        entry.members.includes(classificationId),
    );
  });
}

/**
 * The relationship labels a user may pick for a new relation row with an
 * organization of the given classification. Each directional label implies one
 * side of the membership for the organization being edited: `role.label`
 * (referred to as `opLabel` on role models) puts it on the `member` side,
 * `role.inverseLabel` on the `organization` side. A label is offered only when
 * the rules place the classification on the side the label implies, so every
 * offered label leads to a non-empty organization select.
 *
 * @param {string} classificationId - classification of the organization.
 * @returns {string[]} sorted list of the usable labels.
 */
export function allowedRoleLabelsForClassification(classificationId) {
  const labels = new Set();
  MEMBERSHIP_ROLES.forEach((role) => {
    const relations = allowedMembershipRelations.get(role.id) || [];

    if (role.id === MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id) {
      // This role has no direction for the user and both labels are one and
      // the same string, so offer it once when the rules know the
      // classification on either side.
      if (
        relations.some(
          (entry) =>
            entry.organizations.includes(classificationId) ||
            entry.members.includes(classificationId),
        )
      ) {
        labels.add(role.label);
      }
    } else {
      if (relations.some((entry) => entry.members.includes(classificationId))) {
        labels.add(role.label);
      }
      if (
        relations.some((entry) =>
          entry.organizations.includes(classificationId),
        )
      ) {
        labels.add(role.inverseLabel);
      }
    }
  });

  return Array.from(labels).sort();
}

/**
 * The classification codes of the organizations that may be selected for a
 * related-organization field, derived from the `allowed*Memberships` tables.
 *
 * @param {string} classificationId - classification of the organization the
 *     field belongs to.
 * @param {object} field - entry of `membershipFieldsByClassification`.
 * @returns {string[]} the classification codes that may be selected.
 */
export function allowedClassificationsForMembershipField(
  classificationId,
  field,
) {
  const relations = allowedMembershipRelations.get(field.role.id) || [];
  const entries = field.asMember
    ? relations.filter((entry) => entry.members.includes(classificationId))
    : relations.filter((entry) =>
        entry.organizations.includes(classificationId),
      );

  return [
    ...new Set(
      entries.flatMap((entry) =>
        field.asMember ? entry.organizations : entry.members,
      ),
    ),
  ];
}

/**
 * Check whether every field that is mandatory at creation is filled in enough
 * (minimum included).
 *
 * @param {OrganizationModel} organization - the organization being created.
 * @param {MembershipModel[]} memberships - all its memberships, on both the
 *     `organization` and the `member` side.
 * @returns {boolean} true if every mandatory field is filled in.
 */
export function hasRequiredMembershipFields(organization, memberships) {
  return !getUnsatisfiedRequiredField(organization, memberships);
}

/**
 * The first mandatory field of the organization that is not filled in enough,
 * or undefined if they all are. Used to report which field is missing.
 *
 * @param {OrganizationModel} organization - the organization being created.
 * @param {MembershipModel[]} memberships - all its memberships, on both the
 *     `organization` and the `member` side.
 * @returns {object} entry of `membershipFieldsByClassification`, or undefined.
 */
export function getUnsatisfiedRequiredField(organization, memberships) {
  return membershipFieldsFor(organization)
    .filter((field) => field.required)
    .find((field) => !fieldMeetsMinimum(field, organization, memberships));
}

/**
 * Whether the memberships fill the field enough for its minimum. A mandatory
 * field without an explicit minimum needs at least one organization.
 *
 * @param {object} field - entry of `membershipFieldsByClassification`.
 * @param {OrganizationModel} organization - the organization being created.
 * @param {MembershipModel[]} memberships - all its memberships, on both the
 *     `organization` and the `member` side.
 * @returns {boolean} true if the minimum is met.
 */
export function fieldMeetsMinimum(field, organization, memberships) {
  const minimum = field.minimum?.count ?? 1;
  return countMembershipsForField(field, organization, memberships) >= minimum;
}

/**
 * The validation message for a mandatory field that is not filled in enough,
 * e.g. "Kies minstens 1 OCMW". The kind of organizations to pick comes from
 * the minimum itself when it restricts them, otherwise from the
 * classifications the field allows — unless that list is too long to read,
 * then the message stays generic.
 *
 * @param {object} field - entry of `membershipFieldsByClassification`.
 * @param {string} classificationId - classification of the organization the
 *     field belongs to.
 * @returns {string} the message.
 */
export function minimumRequiredFieldMessage(field, classificationId) {
  const count = field.minimum?.count ?? 1;
  const labels = minimumLabels(field, classificationId);
  const target =
    labels.length === 0
      ? `organisatie${count === 1 ? '' : 's'}`
      : count === 1
        ? labels.join(' of ')
        : pluralizeLabel(labels[0]);

  return `Kies minstens ${count} ${target}`;
}

function minimumLabels(field, classificationId) {
  if (field.minimum?.classifications) {
    return field.minimum.classifications.map((code) =>
      classificationLabel(code),
    );
  }

  const allowed = allowedClassificationsForMembershipField(
    classificationId,
    field,
  );
  // E.g. for an "Andere" organization any organization counts, listing all
  // of them would not be readable.
  return allowed.length <= 2
    ? allowed.map((code) => classificationLabel(code))
    : [];
}

function classificationLabel(code) {
  const entry = Object.values(CLASSIFICATION).find((c) => c.id === code);
  const label = entry?.label ?? 'organisatie';
  // Keep acronyms such as "OCMW" as they are.
  return label === label.toUpperCase() ? label : label.toLowerCase();
}

const PLURAL_LABELS = { gemeente: 'gemeenten', provincie: 'provincies' };

function pluralizeLabel(label) {
  return PLURAL_LABELS[label] ?? `${label}s`;
}

/**
 * Check whether removing the membership would take its field below the
 * minimum stated by the OP-3929 rules.
 *
 * @param {MembershipModel} membership - the membership about to be removed.
 * @param {OrganizationModel} organization - the organization being edited.
 * @param {MembershipModel[]} memberships - all memberships shown on the page,
 *     including already deleted ones.
 * @returns {boolean} true if the membership cannot be removed.
 */
export function removingMembershipBreaksMinimum(
  membership,
  organization,
  memberships,
) {
  const field = membershipFieldFor(membership, organization);
  if (!field?.minimum) return false;

  const others = memberships.filter(
    (other) => other !== membership && !other.isDeleted,
  );

  return (
    countMembershipsForField(field, organization, others) < field.minimum.count
  );
}

function membershipFieldsFor(organization) {
  const classificationId = organization.classification?.get('id');
  return membershipFieldsByClassification[classificationId] || [];
}

function membershipFieldFor(membership, organization) {
  const role = membership.belongsTo('role').value();
  const asMember = membership.belongsTo('member').value() === organization;

  return membershipFieldsFor(organization).find(
    (field) => field.role.id === role?.id && field.asMember === asMember,
  );
}

function countMembershipsForField(field, organization, memberships) {
  return (
    memberships
      .filter((membership) => isOnField(field, organization, membership))
      // A membership whose other side is not set, an empty form row, does not
      // count towards the minimum.
      .filter((membership) => hasOtherOrganization(field, membership))
      .filter((membership) => countsTowardsMinimum(field, membership)).length
  );
}

function hasOtherOrganization(field, membership) {
  const other = field.asMember
    ? membership.belongsTo('organization').value()
    : membership.belongsTo('member').value();
  return Boolean(other);
}

/**
 * Whether the membership is one of the field: same role, with the organization
 * on the side the field describes.
 */
function isOnField(field, organization, membership) {
  const role = membership.belongsTo('role').value();
  if (role?.id !== field.role.id) return false;

  // Note: do not rely on ids as this also deals with organizations and
  // memberships that are not persisted yet.
  const member = membership.belongsTo('member').value();
  const memberOrganization = membership.belongsTo('organization').value();
  return field.asMember
    ? member === organization
    : memberOrganization === organization;
}

/**
 * Fields with a classification restriction only count organizations of those
 * classifications towards their minimum.
 */
function countsTowardsMinimum(field, membership) {
  const minimumClassifications = field.minimum?.classifications;
  if (!minimumClassifications) return true;

  const member = membership.belongsTo('member').value();
  const organization = membership.belongsTo('organization').value();
  // The other organization's classification may not be loaded yet; count it
  // towards the minimum in that case.
  const other = field.asMember ? organization : member;
  const classificationId = other?.belongsTo('classification').value()?.id;

  return !classificationId || minimumClassifications.includes(classificationId);
}

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
export function getOppositeClassifications(membership, organization) {
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
