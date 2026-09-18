import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

// Display labels per membership role. `label` is the label as read from the
// perspective of the `member` of a membership, `inverseLabel` the one as read
// from the perspective of its `organization`. The triplestore only holds a
// technical prefLabel for these roles; keep this list in sync with the
// related-organizations report in app-organization-portal.
export const MEMBERSHIP_ROLES_MAPPING = {
  HAS_RELATION_WITH: {
    id: '4ec7d5c39bdc4e84b4174379b9e22ad8',
    label: 'Heeft een relatie met', // has relation with
    inverseLabel: 'Heeft een relatie met', // has relation with
  },
  IS_FOUNDER_OF: {
    id: '73d5e1cf250d42fab15926771f07505a',
    label: 'Is oprichter van', // is founder of
    inverseLabel: 'Werd opgericht door', // was founded by
  },
  PARTICIPATES_IN: {
    id: '2152eb830b1143bfb97a7dd9596d6c63',
    label: 'Is lid van', // is member of
    inverseLabel: 'Heeft als leden', // has as members
  },
  GRANTS_RECOGNITION_TO: {
    id: 'd44a34ed-5007-45fe-9adb-43b695740dbc',
    label: 'Verleent erkenning aan', // grants recognition to
    inverseLabel: 'Werd erkend door', // was recognised by
  },
  IS_REPRESENTED_IN: {
    id: '2c0994d0-5e25-4b43-b2e4-12c98028bccb',
    label: 'Is feitelijk vertegenwoordigd in (niet lidmaatschap)', // is actually represented in (no membership)
    inverseLabel: 'Heeft als feitelijke vertegenwoordigers (niet lidmaatschap)', // has as actual representatives (no membership)
  },
  SERVES: {
    id: 'de8efef6-8d5c-42aa-90e9-1b9e9d27f395',
    label: 'Bedient', // serves
    inverseLabel: 'Wordt bediend door', // is served by
  },
};

export const MEMBERSHIP_ROLES = Object.values(MEMBERSHIP_ROLES_MAPPING);

export default class MembershipRoleModel extends Model {
  @attr label;

  @belongsTo('concept', {
    async: true,
    inverse: null,
  })
  topConceptOf;

  @belongsTo('membership-role', {
    async: true,
    inverse: null,
  })
  hasBroaderRole;

  get hasRelationWith() {
    return this.id == MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id;
  }

  get isFounderOf() {
    return this.id == MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id;
  }

  get participatesIn() {
    return this.id == MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id;
  }

  get grantsRecognition() {
    return this.id == MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO.id;
  }

  get isRepresentedIn() {
    return this.id == MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN.id;
  }

  get serves() {
    return this.id == MEMBERSHIP_ROLES_MAPPING.SERVES.id;
  }

  get opLabel() {
    return MEMBERSHIP_ROLES.find((role) => role.id === this.id)?.label;
  }

  get inverseOpLabel() {
    return MEMBERSHIP_ROLES.find((role) => role.id === this.id)?.inverseLabel;
  }
}
