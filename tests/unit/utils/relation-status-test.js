import { module, test } from 'qunit';
import sinon from 'sinon';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import {
  getRelationStatus,
  hasRelationStarted,
  isRelationEnded,
  RELATION_STATUS,
} from 'frontend-organization-portal/utils/relation-status';

function daysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// The day as the date transform loads an xsd:date: midnight UTC
function asLoaded(date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return new Date(`${date.getFullYear()}-${month}-${day}`);
}

function todayAsLoaded() {
  return asLoaded(new Date());
}

function tomorrowAsLoaded() {
  return asLoaded(daysFromToday(1));
}

module('Unit | Utility | relation-status', function () {
  module('hasRelationStarted', function () {
    test('it has started when the start date is today or earlier', function (assert) {
      assert.true(hasRelationStarted(new Date()));
      assert.true(hasRelationStarted(todayAsLoaded()));
      assert.true(hasRelationStarted(daysFromToday(-1)));
      assert.true(hasRelationStarted(new Date('2024-01-01')));
    });

    test('it has not started when the start date is after today', function (assert) {
      assert.false(hasRelationStarted(daysFromToday(1)));
      assert.false(hasRelationStarted(tomorrowAsLoaded()));
      assert.false(hasRelationStarted(new Date('2999-12-31')));
    });

    test('it has started without start date', function (assert) {
      assert.true(hasRelationStarted(undefined));
      assert.true(hasRelationStarted(null));
    });
  });

  module('isRelationEnded', function () {
    test('it is ended when the end date is before today', function (assert) {
      assert.true(isRelationEnded(daysFromToday(-1)));
      assert.true(isRelationEnded(new Date('2024-01-01')));
    });

    test('it is not ended when the end date is today or later', function (assert) {
      assert.false(isRelationEnded(new Date()));
      assert.false(isRelationEnded(todayAsLoaded()));
      assert.false(isRelationEnded(daysFromToday(1)));
      assert.false(isRelationEnded(new Date('2999-12-31')));
    });

    test('it is not ended without end date', function (assert) {
      assert.false(isRelationEnded(undefined));
      assert.false(isRelationEnded(null));
    });
  });

  module('getRelationStatus', function () {
    test('it is active when there are no dates and both organizations are active', function (assert) {
      const status = getRelationStatus({
        startDate: undefined,
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

    test('it is not active before the start date', function (assert) {
      for (const startDate of [
        daysFromToday(1),
        tomorrowAsLoaded(),
        new Date('2999-12-31'),
      ]) {
        const status = getRelationStatus({
          startDate,
          memberStatusId: ORGANIZATION_STATUS.ACTIVE,
          organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
        });

        assert.strictEqual(status, RELATION_STATUS.INACTIVE);
        assert.propEqual(status, {
          id: ORGANIZATION_STATUS.INACTIVE,
          label: 'Niet actief',
        });
      }
    });

    test('it is active from the start date on', function (assert) {
      for (const startDate of [
        new Date(),
        todayAsLoaded(),
        daysFromToday(-1),
        new Date('2024-01-01'),
      ]) {
        const status = getRelationStatus({
          startDate,
          memberStatusId: ORGANIZATION_STATUS.ACTIVE,
          organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
        });

        assert.strictEqual(status, RELATION_STATUS.ACTIVE);
      }
    });

    test('it is not active when the end date is in the past', function (assert) {
      const status = getRelationStatus({
        endDate: new Date('2024-01-01'),
        memberStatusId: ORGANIZATION_STATUS.ACTIVE,
        organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.INACTIVE);
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

    test('it is active between the start and end date', function (assert) {
      const status = getRelationStatus({
        startDate: daysFromToday(-1),
        endDate: daysFromToday(1),
        memberStatusId: ORGANIZATION_STATUS.ACTIVE,
        organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.ACTIVE);
    });

    test('it is not active when the member is not active', function (assert) {
      const status = getRelationStatus({
        memberStatusId: ORGANIZATION_STATUS.INACTIVE,
        organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.INACTIVE);
    });

    test('it is not active when the organization is not active', function (assert) {
      const status = getRelationStatus({
        memberStatusId: ORGANIZATION_STATUS.ACTIVE,
        organizationStatusId: ORGANIZATION_STATUS.INACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.INACTIVE);
    });

    test('it is active when an organization is in formation', function (assert) {
      const status = getRelationStatus({
        memberStatusId: ORGANIZATION_STATUS.IN_FORMATION,
        organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
      });

      assert.strictEqual(status, RELATION_STATUS.ACTIVE);
    });
  });

  // The dates are compared with the local clock while a stored date is
  // loaded as midnight UTC: pin the clock to check both sides of midnight.
  // Like the rest of this file, this assumes a time zone at or east of UTC.
  module('around midnight', function (hooks) {
    hooks.afterEach(function () {
      sinon.restore();
    });

    function pinClock(localTime) {
      sinon.useFakeTimers({
        now: new Date(localTime).getTime(),
        toFake: ['Date'],
      });
    }

    test('a relation starting tomorrow has not started just before midnight', function (assert) {
      pinClock('2026-11-09T23:59:00');

      assert.false(hasRelationStarted(new Date('2026-11-10')));
      assert.true(hasRelationStarted(new Date('2026-11-09')));
    });

    test('a relation starting today has started just after midnight', function (assert) {
      pinClock('2026-11-10T00:01:00');

      assert.true(hasRelationStarted(new Date('2026-11-10')));
      assert.false(hasRelationStarted(new Date('2026-11-11')));
    });

    test('a relation ending today has not ended just before midnight', function (assert) {
      pinClock('2026-11-09T23:59:00');

      assert.false(isRelationEnded(new Date('2026-11-09')));
      assert.true(isRelationEnded(new Date('2026-11-08')));
    });

    test('a relation that ended yesterday has ended just after midnight', function (assert) {
      pinClock('2026-11-10T00:01:00');

      assert.true(isRelationEnded(new Date('2026-11-09')));
      assert.false(isRelationEnded(new Date('2026-11-10')));
    });

    test('the status of a relation follows the clock', function (assert) {
      const relation = {
        startDate: new Date('2026-11-10'),
        endDate: new Date('2026-11-10'),
        memberStatusId: ORGANIZATION_STATUS.ACTIVE,
        organizationStatusId: ORGANIZATION_STATUS.ACTIVE,
      };

      pinClock('2026-11-09T23:59:00');
      assert.strictEqual(getRelationStatus(relation), RELATION_STATUS.INACTIVE);

      sinon.restore();
      pinClock('2026-11-10T12:00:00');
      assert.strictEqual(getRelationStatus(relation), RELATION_STATUS.ACTIVE);

      sinon.restore();
      pinClock('2026-11-11T00:01:00');
      assert.strictEqual(getRelationStatus(relation), RELATION_STATUS.INACTIVE);
    });
  });
});
