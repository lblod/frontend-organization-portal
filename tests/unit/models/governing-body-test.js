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

    test('it returns two errors when the period of another governing body is strictly within the period of the model', async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2026-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

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

      otherBodiesStub.restore();
    });

    test('it returns no error when the start and end dates of two governing bodies are identical', async function (assert) {
      let start = new Date('2024-01-01');
      let end = new Date('2025-01-01');

      const otherModel = this.store().createRecord('governing-body', {
        startDate: start,
        endDate: end,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: start,
        endDate: end,
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      otherBodiesStub.restore();
    });

    test("it returns no error when the period of another governing body is strictly after the model's period", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      otherBodiesStub.restore();
    });

    test("it returns no error when the period of another governing body is strictly before the model's period", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      otherBodiesStub.restore();
    });

    test("it returns two errors when the start date of another governing body is strictly between the model's start and end date", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-06-06'),
        endDate: new Date('2026-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

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

      otherBodiesStub.restore();
    });

    test("it returns no error when the model's period is strictly within the period of another governing body", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2025-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should not be undefined');

      otherBodiesStub.restore();
    });

    test("it returns two errors when the start date of another governing body is strictly between the model's start and end date, and they have same end date", async function (assert) {
      const unit = this.store().createRecord('administrative-unit', {
        id: '1234',
      });

      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-06-06'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        administrativeUnit: unit,
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

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

      otherBodiesStub.restore();
    });

    test("it returns two errors when the end date of another governing body is strictly between the model's start and end date", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-06-06'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

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

      otherBodiesStub.restore();
    });

    test("it returns no error when the model's period is strictly within the period of another governing body, and they have the same start date", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2025-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should not be undefined');

      otherBodiesStub.restore();
    });

    test("it returns no error when the model's end date is the same as the start date of another governing body", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should not be undefined');

      otherBodiesStub.restore();
    });

    test("it returns no error when the model's start date is the same as the end date of another governing body", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should not be undefined');

      otherBodiesStub.restore();
    });

    test("it returns no errors when the model's start date is strictly within the period of another governing body and they have the same end date", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2023-06-06'),
        endDate: new Date('2024-01-01'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should not be undefined');

      otherBodiesStub.restore();
    });

    test("it returns no errors when the model's end date is strictly within the period of another governing body and they have the same start date", async function (assert) {
      const otherModel = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
      });

      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-06-06'),
      });

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([otherModel]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should not be undefined');

      otherBodiesStub.restore();
    });

    test('it should not check start date overlap unless it was changed', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2026-01-01'),
      });

      const changedStub = sinon.stub(model, 'changedAttributes');
      changedStub.returns({});

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      changedStub.restore();
    });

    test('it should not check end date overlap unless it was changed', async function (assert) {
      const model = this.store().createRecord('governing-body', {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-02-02'),
      });

      const changedStub = sinon.stub(model, 'changedAttributes');
      changedStub.returns({});

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

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

      const otherBodiesStub = sinon.stub(model, 'getOtherTimedGoverningBodies');
      otherBodiesStub.resolves([]);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.notOk(model.error, 'model.error should be undefined');

      otherBodiesStub.restore();
    });
  });

  module('getOtherTimedGoverningBodies', function () {
    test('it returns an empty array when there are no other timed governing bodies', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        { id: '1234' }
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: '5ab0e9b8a3b2ca7c5e000005' }
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });

      const timedBody = this.store().createRecord('governing-body', {
        isTimeSpecializationOf: untimedBody,
      });
      untimedBody.hasTimeSpecializations.pushObject(timedBody);

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([untimedBody]));

      const governingBodies = await timedBody.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 0);

      queryStub.restore();
    });

    test('it returns an array containing the other timed governing bodies when there is one of the same classification', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        { id: '1234' }
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: '5ab0e9b8a3b2ca7c5e000005' }
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });

      const timedBodyOne = this.store().createRecord('governing-body', {
        id: 1,
        isTimeSpecializationOf: untimedBody,
      });
      const timedBodyTwo = this.store().createRecord('governing-body', {
        id: 2,
        isTimeSpecializationOf: untimedBody,
      });
      untimedBody.hasTimeSpecializations.pushObjects([
        timedBodyOne,
        timedBodyTwo,
      ]);

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
        { id: '1234' }
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'model' }
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });
      const timedBody = this.store().createRecord('governing-body', {
        id: 1,
        isTimeSpecializationOf: untimedBody,
      });
      untimedBody.hasTimeSpecializations.pushObject(timedBody);

      const classificationCodeOther = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'other' }
      );
      const untimedBodyOther = this.store().createRecord('governing-body', {
        classification: classificationCodeOther,
        administrativeUnit: administrativeUnit,
      });
      const timedBodyOther = this.store().createRecord('governing-body', {
        id: 2,
        isTimeSpecializationOf: untimedBodyOther,
      });
      untimedBodyOther.hasTimeSpecializations.pushObject(timedBodyOther);

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
        { id: '1234' }
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'model' }
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });
      const timedBody = this.store().createRecord('governing-body', {
        id: 1,
        isTimeSpecializationOf: untimedBody,
      });
      untimedBody.hasTimeSpecializations.pushObject(timedBody);

      const classificationCodeOther = this.store().createRecord(
        'governing-body-classification-code',
        { id: EXECUTIVE_ORGANEN[0] }
      );
      const untimedBodyOther = this.store().createRecord('governing-body', {
        classification: classificationCodeOther,
        administrativeUnit: administrativeUnit,
      });
      const timedBodyOther = this.store().createRecord('governing-body', {
        id: 2,
        isTimeSpecializationOf: untimedBodyOther,
      });
      untimedBodyOther.hasTimeSpecializations.pushObject(timedBodyOther);

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([untimedBody, untimedBodyOther]));

      const governingBodies = await timedBody.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 0);

      queryStub.restore();
    });

    test('it returns all other timed governing bodies that are not executive organs', async function (assert) {
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        { id: '1234' }
      );

      const classificationCode = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'model' }
      );
      const untimedBody = this.store().createRecord('governing-body', {
        classification: classificationCode,
        administrativeUnit: administrativeUnit,
      });
      const timedBody = this.store().createRecord('governing-body', {
        id: 1,
        isTimeSpecializationOf: untimedBody,
      });
      untimedBody.hasTimeSpecializations.pushObject(timedBody);

      const classificationCodeOther = this.store().createRecord(
        'governing-body-classification-code',
        { id: 'other' }
      );
      const untimedBodyOther = this.store().createRecord('governing-body', {
        classification: classificationCodeOther,
        administrativeUnit: administrativeUnit,
      });
      const timedBodyOther = this.store().createRecord('governing-body', {
        id: 2,
        isTimeSpecializationOf: untimedBodyOther,
      });
      const timedBodyOtherTwo = this.store().createRecord('governing-body', {
        id: 3,
        isTimeSpecializationOf: untimedBodyOther,
      });
      untimedBodyOther.hasTimeSpecializations.pushObjects([
        timedBodyOther,
        timedBodyOtherTwo,
      ]);

      const classificationCodeExec = this.store().createRecord(
        'governing-body-classification-code',
        { id: EXECUTIVE_ORGANEN[0] }
      );
      const untimedBodyExec = this.store().createRecord('governing-body', {
        classification: classificationCodeExec,
        administrativeUnit: administrativeUnit,
      });
      const timedBodyExec = this.store().createRecord('governing-body', {
        isTimeSpecializationOf: untimedBodyExec,
      });
      untimedBodyExec.hasTimeSpecializations.pushObject(timedBodyExec);

      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([untimedBody, untimedBodyOther, untimedBodyExec]));

      const governingBodies = await timedBody.getOtherTimedGoverningBodies();
      assert.strictEqual(governingBodies.length, 2);
      assert.true(governingBodies.includes(timedBodyOther));
      assert.true(governingBodies.includes(timedBodyOtherTwo));

      queryStub.restore();
    });
  });
});
