import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import {
  isEmptyPeriod,
  periodsOverlap,
} from 'frontend-organization-portal/utils/period-of-time';

module('Unit | Utility | period-of-time', function (hooks) {
  setupTest(hooks);

  module('isEmptyPeriod', function () {
    test('it is true without a period', function (assert) {
      assert.true(isEmptyPeriod(null));
      assert.true(isEmptyPeriod(undefined));
    });

    test('it is true when no dates are set', function (assert) {
      const period = this.owner
        .lookup('service:store')
        .createRecord('period-of-time');

      assert.true(isEmptyPeriod(period));
    });

    test('it is false when a start date is set', function (assert) {
      const period = this.owner
        .lookup('service:store')
        .createRecord('period-of-time', { startDate: new Date('2024-01-01') });

      assert.false(isEmptyPeriod(period));
    });

    test('it is false when an end date is set', function (assert) {
      const period = this.owner
        .lookup('service:store')
        .createRecord('period-of-time', { endDate: new Date('2025-01-01') });

      assert.false(isEmptyPeriod(period));
    });
  });

  module('periodsOverlap', function () {
    // A period from the given days, `null` for a missing date
    function period(startDate, endDate) {
      return {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      };
    }

    test('it is true when one period starts during the other', function (assert) {
      const a = period('2010-01-01', '2015-12-31');
      const b = period('2014-01-01', '2018-12-31');

      assert.true(periodsOverlap(a, b));
      assert.true(periodsOverlap(b, a));
    });

    test('it is true when one period lies within the other', function (assert) {
      const a = period('2010-01-01', '2018-12-31');
      const b = period('2014-01-01', '2015-12-31');

      assert.true(periodsOverlap(a, b));
      assert.true(periodsOverlap(b, a));
    });

    test('it is false when one period ends before the other starts', function (assert) {
      const a = period('2010-01-01', '2015-12-31');
      const b = period('2016-01-01', '2018-12-31');

      assert.false(periodsOverlap(a, b));
      assert.false(periodsOverlap(b, a));
    });

    test('it is true when one period ends on the day the other starts', function (assert) {
      const a = period('2010-01-01', '2015-12-31');
      const b = period('2015-12-31', '2018-12-31');

      assert.true(periodsOverlap(a, b));
      assert.true(periodsOverlap(b, a));
    });

    test('a period without start date has always been running', function (assert) {
      const a = period(null, '2015-12-31');

      assert.true(periodsOverlap(a, period('2010-01-01', '2012-12-31')));
      assert.true(periodsOverlap(a, period('2014-01-01', null)));
      assert.false(periodsOverlap(a, period('2016-01-01', '2018-12-31')));
      assert.false(periodsOverlap(a, period('2016-01-01', null)));
    });

    test('a period without end date is still running', function (assert) {
      const a = period('2010-01-01', null);

      assert.true(periodsOverlap(a, period('2030-01-01', '2031-12-31')));
      assert.true(periodsOverlap(a, period(null, '2010-01-01')));
      assert.false(periodsOverlap(a, period('2000-01-01', '2009-12-31')));
      assert.false(periodsOverlap(a, period(null, '2009-12-31')));
    });

    test('a period without dates overlaps with every period', function (assert) {
      assert.true(
        periodsOverlap(period(null, null), period('2010-01-01', '2015-12-31')),
      );
      assert.true(
        periodsOverlap(period('2010-01-01', '2015-12-31'), period(null, null)),
      );
      assert.true(periodsOverlap(null, period('2010-01-01', '2015-12-31')));
      assert.true(
        periodsOverlap(period('2010-01-01', '2015-12-31'), undefined),
      );
      assert.true(periodsOverlap(null, null));
    });
  });
});
