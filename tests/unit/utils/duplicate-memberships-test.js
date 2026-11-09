import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import {
  findDuplicatedMembership,
  isDuplicateMembership,
  isSameRelation,
} from 'frontend-organization-portal/utils/duplicate-memberships';

module('Unit | Utility | duplicate-memberships', function (hooks) {
  setupTest(hooks);

  const PARTICIPATES_IN = MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id;
  const HAS_RELATION_WITH = MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id;

  /**
   * Push the organizations `a` and `b` with their statuses and the roles, as
   * the edit route would have loaded them.
   */
  function pushOrganizations(
    store,
    {
      statusOfA = ORGANIZATION_STATUS.ACTIVE,
      statusOfB = ORGANIZATION_STATUS.ACTIVE,
    } = {},
  ) {
    const status = (id) => ({
      type: 'organization-status-code',
      id,
      attributes: { label: id },
    });
    const organization = (id, statusId) => ({
      type: 'organization',
      id,
      attributes: { name: id },
      relationships: {
        organizationStatus: {
          data: { type: 'organization-status-code', id: statusId },
        },
      },
    });
    const [, , , a, b, c, participatesIn, hasRelationWith] = store.push({
      data: [
        status(ORGANIZATION_STATUS.ACTIVE),
        status(ORGANIZATION_STATUS.INACTIVE),
        status(ORGANIZATION_STATUS.IN_FORMATION),
        organization('a', statusOfA),
        organization('b', statusOfB),
        organization('c', ORGANIZATION_STATUS.ACTIVE),
        { type: 'membership-role', id: PARTICIPATES_IN, attributes: {} },
        { type: 'membership-role', id: HAS_RELATION_WITH, attributes: {} },
      ],
    });
    return { a, b, c, participatesIn, hasRelationWith };
  }

  /**
   * A new membership, with a new period when dates are given.
   */
  function newMembership(store, { member, organization, role, period }) {
    return store.createRecord('membership', {
      member,
      organization,
      role,
      during: period ? store.createRecord('period-of-time', period) : null,
    });
  }

  /**
   * A stored membership of `member` and `organization`, with a stored period
   * when dates are given.
   */
  function storedMembership(store, id, { member, organization, role, period }) {
    const [membership] = store.push({
      data: [
        {
          type: 'membership',
          id,
          relationships: {
            member: { data: { type: 'organization', id: member.id } },
            organization: {
              data: { type: 'organization', id: organization.id },
            },
            role: { data: { type: 'membership-role', id: role.id } },
            during: {
              data: period
                ? { type: 'period-of-time', id: `${id}-period` }
                : null,
            },
          },
        },
        ...(period
          ? [{ type: 'period-of-time', id: `${id}-period`, attributes: period }]
          : []),
      ],
    });
    return membership;
  }

  module('isSameRelation', function () {
    test('it is false while the role or an organization is not picked', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.false(isSameRelation(newMembership(store, {}), stored));
      assert.false(
        isSameRelation(newMembership(store, { role: participatesIn }), stored),
      );
      assert.false(
        isSameRelation(
          newMembership(store, { role: participatesIn, member: a }),
          stored,
        ),
      );
      assert.false(
        isSameRelation(
          newMembership(store, { member: a, organization: b }),
          stored,
        ),
      );
    });

    test('it is false while the other membership is not filled in', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.false(isSameRelation(added, newMembership(store, {})));
      assert.false(
        isSameRelation(added, newMembership(store, { role: participatesIn })),
      );
      assert.false(
        isSameRelation(
          added,
          newMembership(store, { member: a, organization: b }),
        ),
      );
    });

    test('it is true for the same role between the same organizations', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.true(isSameRelation(added, stored));
      assert.true(isSameRelation(stored, added));
    });

    test('it is false for another role or another organization', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, c, participatesIn, hasRelationWith } =
        pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.false(
        isSameRelation(
          newMembership(store, {
            member: a,
            organization: b,
            role: hasRelationWith,
          }),
          stored,
        ),
      );
      assert.false(
        isSameRelation(
          newMembership(store, {
            member: a,
            organization: c,
            role: participatesIn,
          }),
          stored,
        ),
      );
    });

    test('it is false when the sides are swapped for a role with a direction', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });
      const added = newMembership(store, {
        member: b,
        organization: a,
        role: participatesIn,
      });

      assert.false(isSameRelation(added, stored));
    });

    test('it is true when the sides are swapped for the "has a relation with" role', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, hasRelationWith } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: hasRelationWith,
      });
      const added = newMembership(store, {
        member: b,
        organization: a,
        role: hasRelationWith,
      });

      assert.true(isSameRelation(added, stored));
      assert.true(isSameRelation(stored, added));
    });
  });

  module('isDuplicateMembership', function () {
    test('a membership is not a duplicate of itself', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.false(isDuplicateMembership(stored, stored));
    });

    test('it is true when the stored relation has no dates', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.true(
        isDuplicateMembership(
          newMembership(store, {
            member: a,
            organization: b,
            role: participatesIn,
          }),
          stored,
        ),
      );
      assert.true(
        isDuplicateMembership(
          newMembership(store, {
            member: a,
            organization: b,
            role: participatesIn,
            period: { startDate: new Date('2026-01-01') },
          }),
          stored,
        ),
      );
    });

    test('it is false for a relation that starts after the stored one ended', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
        period: {
          startDate: new Date('2010-01-01'),
          endDate: new Date('2015-12-31'),
        },
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
        period: { startDate: new Date('2016-01-01') },
      });

      assert.false(isDuplicateMembership(added, stored));
    });

    test('it is false for a relation that ended before the stored one starts', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
        period: { startDate: new Date('2020-01-01') },
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
        period: {
          startDate: new Date('2010-01-01'),
          endDate: new Date('2015-12-31'),
        },
      });

      assert.false(isDuplicateMembership(added, stored));
    });

    test('it is true for a relation without dates next to an ended one', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
        period: { endDate: new Date('2015-12-31') },
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.true(isDuplicateMembership(added, stored));
    });

    test('it is true for a relation that starts on the day the stored one ends', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
        period: { endDate: new Date('2015-12-31') },
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
        period: { startDate: new Date('2015-12-31') },
      });

      assert.true(isDuplicateMembership(added, stored));
    });

    test('it is true whatever the dates when the related organization is not active', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store, {
        statusOfB: ORGANIZATION_STATUS.INACTIVE,
      });
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
        period: { endDate: new Date('2015-12-31') },
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
        period: { startDate: new Date('2016-01-01') },
      });

      assert.true(isDuplicateMembership(added, stored));
    });

    test('it is true whatever the dates when the organization being edited is not active', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store, {
        statusOfA: ORGANIZATION_STATUS.INACTIVE,
      });
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
        period: { endDate: new Date('2015-12-31') },
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
        period: { startDate: new Date('2016-01-01') },
      });

      assert.true(isDuplicateMembership(added, stored));
    });

    test('an organization in formation counts as active', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store, {
        statusOfB: ORGANIZATION_STATUS.IN_FORMATION,
      });
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
        period: { endDate: new Date('2015-12-31') },
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
        period: { startDate: new Date('2016-01-01') },
      });

      assert.false(isDuplicateMembership(added, stored));
    });

    test('it is false for another relation', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, c, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });
      const added = newMembership(store, {
        member: a,
        organization: c,
        role: participatesIn,
      });

      assert.false(isDuplicateMembership(added, stored));
    });
  });

  module('findDuplicatedMembership', function () {
    test('it finds the earlier membership that is duplicated', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, c, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });
      const other = storedMembership(store, 'other', {
        member: a,
        organization: c,
        role: participatesIn,
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.strictEqual(
        findDuplicatedMembership(added, [other, stored, added]),
        stored,
      );
    });

    test('it is undefined when no earlier membership is duplicated', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, c, participatesIn } = pushOrganizations(store);
      const other = storedMembership(store, 'other', {
        member: a,
        organization: c,
        role: participatesIn,
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.strictEqual(
        findDuplicatedMembership(added, [other, added]),
        undefined,
      );
    });

    test('of two identical new rows only the second one is a duplicate', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const first = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
      });
      const second = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
      });
      const memberships = [first, second];

      assert.strictEqual(
        findDuplicatedMembership(first, memberships),
        undefined,
      );
      assert.strictEqual(findDuplicatedMembership(second, memberships), first);
    });

    test('a membership outside the list is compared with every membership', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
      });

      assert.strictEqual(findDuplicatedMembership(added, [stored]), stored);
    });

    test('it ignores a membership that is being removed', function (assert) {
      const store = this.owner.lookup('service:store');
      const { a, b, participatesIn } = pushOrganizations(store);
      const stored = storedMembership(store, 'stored', {
        member: a,
        organization: b,
        role: participatesIn,
      });
      const added = newMembership(store, {
        member: a,
        organization: b,
        role: participatesIn,
      });

      stored.deleteRecord();

      assert.strictEqual(
        findDuplicatedMembership(added, [stored, added]),
        undefined,
      );
    });
  });
});
