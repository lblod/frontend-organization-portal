import { module, test } from 'qunit';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import {
  getRelationStatus,
  isRelationEnded,
  RELATION_STATUS,
} from 'frontend-organization-portal/utils/relation-status';

function daysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

module('Unit | Utility | relation-status', function () {
  module('isRelationEnded', function () {
    test('it is ended when the end date is before today', function (assert) {
      assert.true(isRelationEnded(daysFromToday(-1)));
      assert.true(isRelationEnded(new Date('2024-01-01')));
    });

    test('it is not ended when the end date is today or later', function (assert) {
      assert.false(isRelationEnded(new Date()));
      assert.false(isRelationEnded(daysFromToday(1)));
      assert.false(isRelationEnded(new Date('2999-12-31')));
    });

    test('it is not ended without end date', function (assert) {
      assert.false(isRelationEnded(undefined));
      assert.false(isRelationEnded(null));
    });
  });

  module('getRelationStatus', function () {
    test('it is active when there is no end date and both organizations are active', function (assert) {
      const status = getRelationStatus({
        endDate: undefined,
        memberStatusId: ORGANIZATION_STATUS.ACTIVE,
        organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.ACTIVE);
      assert.propEqual(status, {
        id: ORGANIZATION_STATUS.ACTIVE,
        label: 'Actief',
      });
    });

    test('it is not active when the end date is in the past', function (assert) {
      const status = getRelationStatus({
        endDate: new Date('2024-01-01'),
        memberStatusId: ORGANIZATION_STATUS.ACTIVE,
        organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.INACTIVE);
      assert.propEqual(status, {
        id: ORGANIZATION_STATUS.INACTIVE,
        label: 'Niet actief',
      });
    });

    test('it is active when the end date is today or in the future', function (assert) {
      for (const endDate of [
        new Date(),
        daysFromToday(1),
        new Date('2999-12-31'),
      ]) {
        const status = getRelationStatus({
          endDate,
          memberStatusId: ORGANIZATION_STATUS.ACTIVE,
          organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
        });

        assert.strictEqual(status, RELATION_STATUS.ACTIVE);
      }
    });

    test('it is not active when the member is not active', function (assert) {
      const status = getRelationStatus({
        endDate: undefined,
        memberStatusId: ORGANIZATION_STATUS.INACTIVE,
        organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.INACTIVE);
    });

    test('it is not active when the organization is not active', function (assert) {
      const status = getRelationStatus({
        endDate: undefined,
        memberStatusId: ORGANIZATION_STATUS.ACTIVE,
        organizationStatusId: ORGANIZATION_STATUS.INACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.INACTIVE);
    });

    test('it is active when an organization is in formation', function (assert) {
      const status = getRelationStatus({
        endDate: undefined,
        memberStatusId: ORGANIZATION_STATUS.IN_FORMATION,
        organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.ACTIVE);
    });
  });
});
