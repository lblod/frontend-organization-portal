import { inPeriod } from 'frontend-organization-portal/utils/date';
import { module, test } from 'qunit';

module('Unit | Utility | date', function () {
  module('inPeriod', function () {
    test('it returns true when date is between start and end', function (assert) {
      const date = new Date('2024-06-06');
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.true(inPeriod(date, start, end));
    });

    test('it returns false when date is the same as start', function (assert) {
      const date = new Date('2024-01-01');
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.false(inPeriod(date, start, end));
    });

    test('it returns false when date is the same as end', function (assert) {
      const date = new Date('2025-01-01');
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.false(inPeriod(date, start, end));
    });

    test('it returns false when date is before start', function (assert) {
      const date = new Date('2023-01-01');
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.false(inPeriod(date, start, end));
    });

    test('it returns false when date is after end', function (assert) {
      const date = new Date('2026-01-01');
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.false(inPeriod(date, start, end));
    });

    [
      [undefined, new Date('2024-01-01'), new Date('2025-01-01'), 'date'],
      [new Date('2024-01-01'), undefined, new Date('2025-01-01'), 'start'],
      [new Date('2024-01-01'), new Date('2025-01-01'), undefined, 'end'],
    ].forEach(([date, start, end, undefinedArg]) => {
      test(`it throws an assertion error when ${undefinedArg} is undefined`, function (assert) {
        assert.throws(
          () => inPeriod(date, start, end),
          'All parameters must be valid Date objects.',
        );
      });
    });

    test('it throws an assertion error when start is after end', function (assert) {
      const date = new Date('2023-01-01');
      const start = new Date('2025-01-01');
      const end = new Date('2024-01-01');

      assert.throws(
        () => inPeriod(date, start, end),
        'Start date must be before end date.',
      );
    });
  });
});
