import Model, { attr, belongsTo } from '@ember-data/model';

export const MEMBERSHIP_ROLES = [
  {
    id: '4ec7d5c39bdc4e84b4174379b9e22ad8',
    label: 'Heeft een relatie met', // has relation with
    inverseLabel: 'Heeft een relatie met', // has relation with
  },
  {
    id: '73d5e1cf250d42fab15926771f07505a',
    label: 'Is oprichter van', // is founder of
    inverseLabel: 'Werd opgericht door ', // was founded by
  },
  {
    id: '2152eb830b1143bfb97a7dd9596d6c63',
    label: 'Participeert in', // participates in
    inverseLabel: 'Heeft als participanten', // has as participants
  },
];

export const MEMBERSHIP_ROLES_MAPPING = {
  HAS_RELATION_WITH: {
    id: '4ec7d5c39bdc4e84b4174379b9e22ad8',
    label: 'Heeft een relatie met', // has relation with
    inverseLabel: 'Heeft een relatie met', // has relation with
  },
  IS_FOUNDER_OF: {
    id: '73d5e1cf250d42fab15926771f07505a',
    label: 'Is oprichter van ', // is founder of
    inverseLabel: 'Werd opgericht door', // was founded by
  },
  PARTICIPATES_IN: {
    id: '2152eb830b1143bfb97a7dd9596d6c63',
    label: 'Participeert in', // participates in
    inverseLabel: 'Heeft als participanten', // has as participants
  },
};

export default class MembershipRoleModel extends Model {
  @attr('string') label;

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

  get opLabel() {
    return MEMBERSHIP_ROLES.find((membership) => membership.id === this.id)
      .label;
  }

  get inverseOpLabel() {
    return MEMBERSHIP_ROLES.find((membership) => membership.id === this.id)
      .inverseLabel;
  }
}
