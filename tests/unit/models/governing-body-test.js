import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { A } from '@ember/array';
import { inPeriod } from 'frontend-organization-portal/models/governing-body';

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
      assert.strictEqual(model.error.startDate.message, 'Vul de startdatum in');
      assert.propContains(model.error, {
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
        startDate: {
          message: 'Kies een startdatum die vóór de einddatum plaatsvindt',
        },
      });
      assert.notPropContains(model.error, {
        endDate: {
          message: 'Kies een einddatum die na de startdatum plaatsvindt',
        },
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
      assert.notPropContains(model.error, {
        startDate: {
          message: 'Kies een startdatum die vóór de einddatum plaatsvindt',
        },
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
      assert.notPropContains(model.error, {
        endDate: {
          message: 'Kies een einddatum die na de startdatum plaatsvindt',
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
      assert.notPropContains(model.error, {
        endDate: {
          message: 'Kies een einddatum die na de startdatum plaatsvindt',
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

    test('it returns an error when the start date is in a period of another governing body', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-06-01'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModel, model]));

      const isValid = await model.validate();

      assert.false(isValid);
      assert.ok(model.error, 'model.error should not be undefined');
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        startDate: {
          message: 'Geen overlap',
        },
      });

      queryStub.restore();
    });

    test('it returns no error when the start date is before the period of another governing body', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-01-01'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModel, model]));

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      queryStub.restore();
    });

    test('it returns no error when the start date is after the period of another governing body', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-01-01'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModel, model]));

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      queryStub.restore();
    });

    test('it should not check start date overlap unless it was changed', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2026-01-01'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModel, model]));

      const changedStub = sinon.stub(model, 'changedAttributes');
      changedStub.returns({});

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      queryStub.restore();
      changedStub.restore();
    });

    test('it returns an error when end date overlaps with another governing body', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-06-06'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModel, model]));

      const isValid = await model.validate();

      assert.false(isValid);
      assert.ok(model.error, 'model.error should not be undefined');
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        endDate: {
          message: 'Geen overlap',
        },
      });

      queryStub.restore();
    });

    test('it returns no error when the end date is before the period of another governing body', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModel, model]));

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      queryStub.restore();
    });

    test('it returns no error when the end date is after the period of another governing body', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-01-01'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModel, model]));

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      queryStub.restore();
    });

    test('it should not check end date overlap unless it was changed', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-02-02'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModel, model]));

      const changedStub = sinon.stub(model, 'changedAttributes');
      changedStub.returns({});

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      queryStub.restore();
      changedStub.restore();
    });

    test('it returns no overlap error when there are no other governing bodies', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2026-01-01'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([model]));

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      queryStub.restore();
    });

    test('it returns two errors when start and end date overlap with another governing body', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2026-01-01'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModel, model]));

      const isValid = await model.validate();

      assert.false(isValid);
      assert.ok(model.error, 'model.error should not be undefined');
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        startDate: {
          message: 'Geen overlap',
        },
        endDate: {
          message: 'Geen overlap',
        },
      });

      queryStub.restore();
    });

    test('it returns two errors when start and end date overlap with other, different governing body', async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModelStart = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
        administrativeUnit: unit,
      });

      const otherModelEnd = this.store().createRecord('governing-body', {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2023-06-06'),
        endDate: new Date('2025-06-06'),
        administrativeUnit: unit,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([otherModelStart, otherModelEnd, model]));

      const isValid = await model.validate();

      assert.false(isValid);
      assert.ok(model.error, 'model.error should not be undefined');
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        startDate: {
          message: 'Geen overlap',
        },
        endDate: {
          message: 'Geen overlap',
        },
      });

      queryStub.restore();
    });
  });

  module('inPeriod', function () {
    test('it returns true when date is between start and end', function (assert) {
      const date = new Date('2024-01-01');
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.true(inPeriod(date, start, end));
    });

    test('it returns true when date is the same as start', function (assert) {
      const date = new Date('2024-01-01');
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.true(inPeriod(date, start, end));
    });

    test('it returns true when date is the same as end', function (assert) {
      const date = new Date('2024-01-01');
      const start = new Date('2024-01-01');
      const end = new Date('2025-01-01');

      assert.true(inPeriod(date, start, end));
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
