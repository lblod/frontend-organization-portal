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

    test('it returns false when date is undefined', function (assert) {
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.false(inPeriod(undefined, start, end));
    });

    test('it returns false when start is undefined', function (assert) {
      const date = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.false(inPeriod(date, undefined, end));
    });

    test('it returns false when end is undefined', function (assert) {
      const date = new Date('2024-01-01');
      const start = new Date('2025-01-01');

      assert.false(inPeriod(date, start, undefined));
    });

    test('it returns false when insufficient arguments', function (assert) {
      const date = new Date('2024-01-01');
      const start = new Date('2025-01-01');

      assert.false(inPeriod(date, start));
    });
  });
});
