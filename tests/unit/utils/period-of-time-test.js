import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import { isEmptyPeriod } from 'frontend-organization-portal/utils/period-of-time';

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
});
