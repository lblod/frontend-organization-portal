import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';

module('Unit | Model | period of time', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('isEmpty', function () {
    test('it is true when no dates are set', function (assert) {
      const model = this.store().createRecord('period-of-time');

      assert.true(model.isEmpty);
    });

    test('it is false when a start date is set', function (assert) {
      const model = this.store().createRecord('period-of-time', {
        startDate: new Date('2024-01-01'),
      });

      assert.false(model.isEmpty);
    });

    test('it is false when an end date is set', function (assert) {
      const model = this.store().createRecord('period-of-time', {
        endDate: new Date('2025-01-01'),
      });

      assert.false(model.isEmpty);
    });
  });

  module('validate', function () {
    test('it returns no errors when no dates are set', async function (assert) {
      const model = this.store().createRecord('period-of-time');

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error);
    });

    test('it returns no errors when only an end date is set', async function (assert) {
      const model = this.store().createRecord('period-of-time', {
        endDate: new Date('2025-01-01'),
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error);
    });

    test('it returns no errors when the start date is before the end date', async function (assert) {
      const model = this.store().createRecord('period-of-time', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error);
    });

    test('it returns no errors when the start date equals the end date', async function (assert) {
      const model = this.store().createRecord('period-of-time', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error);
    });

    test('it returns two errors when the start date is after the end date', async function (assert) {
      const model = this.store().createRecord('period-of-time', {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        startDate: {
          message: 'Kies een startdatum die vóór de einddatum plaatsvindt',
        },
        endDate: {
          message: 'Kies een einddatum die na de startdatum plaatsvindt',
        },
      });
    });
  });
});
