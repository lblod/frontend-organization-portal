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
      assert.notPropContains(model.error, {
        endDate: {
          message: 'Kies een einddatum die na de startdatum plaatsvindt',
        },
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

    test('it returns no errors when valid dates are given', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns an error when the start date is after the end date', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        startDate: {
          message: 'Kies een startdatum die vóór de einddatum plaatsvindt',
        },
      });
    });

    test('it returns an error when the end date is before the start date', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2023-01-01'),
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        endDate: {
          message: 'Kies een einddatum die na de startdatum plaatsvindt',
        },
      });
    });

    test('it returns an error when dates overlap with another governing body', async function (assert) {
      const unit = this.store().createRecord('administrative-unit');

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      // const otherModel = this.store().createRecord('governing-body', {
      //   startDate: new Date('2024-06-01'),
      //   endDate: new Date('2026-01-01'),
      //   administrativeUnit: unit,
      // });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        message: 'Geen overlap',
      });
    });
  });
});
