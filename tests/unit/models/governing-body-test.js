import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | governing body', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    test('it returns errors when model is empty', async function (assert) {
      const model = this.store().createRecord('governing-body');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        startDate: { message: 'Vul de startdatum in' },
        endDate: { message: 'Vul de einddatum in' },
      });
    });

    test('it returns a single error when the start date is missing', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        endDate: new Date('2024-01-01'),
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        startDate: { message: 'Vul de startdatum in' },
      });
    });

    test('it returns a single error when the given start date is invalid', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: 'Not a date',
        endDate: new Date('2025-01-01'),
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        startDate: { message: 'Vul de startdatum in' },
      });
    });

    test('it returns a single error when the end date is missing', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        endDate: { message: 'Vul de einddatum in' },
      });
      assert.notPropContains(model.error, {
        startDate: {
          message: 'Kies een startdatum die vóór de einddatum plaatsvindt',
        },
      });
    });

    test('it returns a single error when the given end date is invalid', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2025-01-01'),
        endDate: 'Not a date',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        endDate: { message: 'Vul de einddatum in' },
      });
      assert.notPropContains(model.error, {
        startDate: {
          message: 'Kies een startdatum die vóór de einddatum plaatsvindt',
        },
      });
    });

    test('it returns no errors when valid dates are given', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-01-01'),
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error);
    });

    test('it returns two errors when the start date is after the end date', async function (assert) {
      const model = this.store().createRecord('governing-body', {
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

    test('it returns two errors when the end date is before the start date', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2023-01-01'),
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

  module('get period', function () {
    test('it should return a string with start and end year', function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      });
      const period = model.period;

      assert.deepEqual(period, '2024 - 2025');
    });

    test('it should return a string with only the start year', function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
      });
      const period = model.period;

      assert.deepEqual(period, '2024 -');
    });

    test('it should return a string with only the end year', function (assert) {
      const model = this.store().createRecord('governing-body', {
        endDate: new Date('2025-01-01'),
      });
      const period = model.period;

      assert.deepEqual(period, '- 2025');
    });

    test('it should return a string containing only a dash', function (assert) {
      const model = this.store().createRecord('governing-body');
      const period = model.period;

      assert.deepEqual(period, '-');
    });
  });
});
