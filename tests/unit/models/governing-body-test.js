import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { A } from '@ember/array';
import { EXECUTIVE_ORGANEN } from 'frontend-organization-portal/models/governing-body-classification-code';

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

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error);

      otherBodiesStub.restore();
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

    [
      [
        // model: |------|
        // other:           |------|
        '2020-01-01',
        '2022-01-01',
        '2024-01-01',
        '2026-01-01',
        "period is strictly before another governing body's period",
      ],
      [
        // model:           |------|
        // other: |------|
        '2024-01-01',
        '2026-01-01',
        '2020-01-01',
        '2022-01-01',
        "period is strictly after another governing body's period",
      ],
      [
        // model: |------|
        // other: |------|
        '2023-01-01',
        '2024-01-01',
        '2023-01-01',
        '2024-01-01',
        'start and end date are identical to those of another governing body',
      ],
      [
        // model:   |--|
        // other: |------|
        '2023-06-06',
        '2024-06-06',
        '2023-01-01',
        '2025-01-01',
        'period is strictly within the period of another governing body',
      ],
      [
        // model:    |---|
        // other: |------|
        '2023-06-06',
        '2024-01-01',
        '2023-01-01',
        '2024-01-01',
        'start date is strictly within the period of another governing body and they have the same end date',
      ],
      [
        // model: |---|
        // other: |------|
        '2023-01-01',
        '2023-06-06',
        '2023-01-01',
        '2024-01-01',
        'end date is strictly within the period of another governing body and they have the same start date',
      ],
      [
        // model: |------|
        // other:        |------|
        '2023-01-01',
        '2024-01-01',
        '2024-01-01',
        '2025-01-01',
        'end date is the same as the start date of another governing body',
      ],
      [
        // model:        |------|
        // other: |------|
        '2024-01-01',
        '2025-01-01',
        '2023-01-01',
        '2024-01-01',
        'start date is the same as the end date of another governing body',
      ],
    ].forEach(([modelStart, modelEnd, otherStart, otherEnd, description]) => {
      test(`it returns no errors when the model's ${description}`, async function (assert) {
        const model = this.store().createRecord('governing-body', {
          startDate: new Date(modelStart),
          endDate: new Date(modelEnd),
        });

        const otherModel = this.store().createRecord('governing-body', {
          startDate: new Date(otherStart),
          endDate: new Date(otherEnd),
        });

        const otherBodiesStub = sinon.stub(
          model,
          'getOtherTimedGoverningBodies',
        );
        otherBodiesStub.resolves([otherModel]);

        const isValid = await model.validate();

        assert.true(isValid);
        assert.notOk(model.error, 'model.error should not be undefined');

        otherBodiesStub.restore();
      });
    });
  });
  module('getOtherTimedGoverningBodies', function () {
    test('it returns an empty array when there are no other timed governing bodies', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        { id: '1234' },
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: '5ab0e9b8a3b2ca7c5e000005' },
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });

      const timedBody = this.store().createRecord('governing-body', {
        isTimeSpecializationOf: untimedBody,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([untimedBody]));

      const governingBodies = await timedBody.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 0);

      queryStub.restore();
    });

    test('it returns an empty array for a governing body without relations', async function (assert) {
      const model = this.store().createRecord('governing-body');

      const governingBodies = await model.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 0);
    });

    test('it returns an empty array when the model is not a time specialisation of another governing body', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        { id: '1234' },
      );

      const model = this.store().createRecord('governing-body', {
        administrativeUnit: administrativeUnit,
      });

      const governingBodies = await model.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 0);
    });

    test('it returns an empty array when there is no related administrative unit', async function (assert) {
      const untimedBody = this.store().createRecord('governing-body');

      const timedBody = this.store().createRecord('governing-body', {
        isTimeSpecializationOf: untimedBody,
      });

      const governingBodies = await timedBody.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 0);
    });

    test('it returns an empty array when the related administrative unit has no identifier', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
      );

      const untimedBody = this.store().createRecord('governing-body', {
        administrativeUnit: administrativeUnit,
      });

      const timedBody = this.store().createRecord('governing-body', {
        isTimeSpecializationOf: untimedBody,
      });

      const governingBodies = await timedBody.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 0);
    });

    test('it returns an array containing the other timed governing bodies when there is one of the same classification', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        { id: '1234' },
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: '5ab0e9b8a3b2ca7c5e000005' },
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });

      const timedBodyOne = this.store().createRecord('governing-body', {
        id: '1',
        isTimeSpecializationOf: untimedBody,
      });
      const timedBodyTwo = this.store().createRecord('governing-body', {
        id: '2',
        isTimeSpecializationOf: untimedBody,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([untimedBody]));

      const governingBodies = await timedBodyOne.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 1);
      assert.true(governingBodies.includes(timedBodyTwo));

      queryStub.restore();
    });

    test('it returns an array containing a governing body with a different classification', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        { id: '1234' },
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'model' },
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });
      const timedBody = this.store().createRecord('governing-body', {
        id: '1',
        isTimeSpecializationOf: untimedBody,
      });

      const classificationCodeOther = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'other' },
      );
      const untimedBodyOther = this.store().createRecord('governing-body', {
        classification: classificationCodeOther,
        administrativeUnit: administrativeUnit,
      });
      const timedBodyOther = this.store().createRecord('governing-body', {
        id: '2',
        isTimeSpecializationOf: untimedBodyOther,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([untimedBody, untimedBodyOther]));

      const governingBodies = await timedBody.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 1);
      assert.true(governingBodies.includes(timedBodyOther));

      queryStub.restore();
    });

    test('it returns an empty array when all other governing bodies are executive organs', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        { id: '1234' },
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'model' },
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });
      const timedBody = this.store().createRecord('governing-body', {
        id: '1',
        isTimeSpecializationOf: untimedBody,
      });

      const classificationCodeOther = this.store().createRecord(
        'governing-body-classification-code',
        { id: EXECUTIVE_ORGANEN[0] },
      );
      const untimedBodyOther = this.store().createRecord('governing-body', {
        classification: classificationCodeOther,
        administrativeUnit: administrativeUnit,
      });

      this.store().createRecord('governing-body', {
        id: '2',
        isTimeSpecializationOf: untimedBodyOther,
      });

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([untimedBody, untimedBodyOther]));

      const governingBodies = await timedBody.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 0);

      queryStub.restore();
    });

    test('it returns all other timed governing bodies that are not executive organs', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        { id: '1234' },
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'model' },
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });
      const timedBody = this.store().createRecord('governing-body', {
        id: '1',
        isTimeSpecializationOf: untimedBody,
      });

      const classificationCodeOther = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'other' },
      );
      const untimedBodyOther = this.store().createRecord('governing-body', {
        classification: classificationCodeOther,
        administrativeUnit: administrativeUnit,
      });
      const timedBodyOther = this.store().createRecord('governing-body', {
        id: '2',
        isTimeSpecializationOf: untimedBodyOther,
      });
      const timedBodyOtherTwo = this.store().createRecord('governing-body', {
        id: '3',
        isTimeSpecializationOf: untimedBodyOther,
      });

      const classificationCodeExec = this.store().createRecord(
        'governing-body-classification-code',
        { id: EXECUTIVE_ORGANEN[0] },
      );
      const untimedBodyExec = this.store().createRecord('governing-body', {
        classification: classificationCodeExec,
        administrativeUnit: administrativeUnit,
      });
      const timedBodyExec = this.store().createRecord('governing-body');
      (await untimedBodyExec.hasTimeSpecializations).push(timedBodyExec);

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([untimedBody, untimedBodyOther, untimedBodyExec]));

      const governingBodies = await timedBody.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 2);
      assert.true(governingBodies.includes(timedBodyOther));
      assert.true(governingBodies.includes(timedBodyOtherTwo));

      queryStub.restore();
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
