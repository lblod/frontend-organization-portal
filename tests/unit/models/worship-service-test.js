import { module, test } from 'qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';

import { setupTest } from 'frontend-organization-portal/tests/helpers';

module('Unit | Model | worship service', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns errors when model is empty', async function (assert) {
      const model = this.store().createRecord('worship-service');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 4);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
        scope: { message: 'Selecteer een optie' },
      });
    });

    test(`it should return an extra error when creating a new ${CLASSIFICATION.WORSHIP_SERVICE.label} without a membership`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.WORSHIP_SERVICE,
      );
      const model = this.store().createRecord('worship-service', {
        classification,
      });

      const isValid = await model.validate({ creatingNewOrganization: true });

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 5);

      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        organizationStatus: { message: 'Selecteer een optie' },
        recognizedWorshipType: { message: 'Selecteer een optie' },
        memberships: { message: 'Selecteer een optie' },
        scope: { message: 'Selecteer een optie' },
      });
    });

    test(`it should not return an extra error when creating a new ${CLASSIFICATION.WORSHIP_SERVICE.label} with a membership`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.WORSHIP_SERVICE,
      );
      const membership = this.store().createRecord('membership');
      const model = this.store().createRecord('worship-service', {
        classification,
        memberships: [membership],
      });

      const isValid = await model.validate({ creatingNewOrganization: true });

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 4);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        organizationStatus: { message: 'Selecteer een optie' },
        recognizedWorshipType: { message: 'Selecteer een optie' },
        scope: { message: 'Selecteer een optie' },
      });
    });

    test(`it should not return an extra error when editing an existing ${CLASSIFICATION.WORSHIP_SERVICE.label} without a membership`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.WORSHIP_SERVICE,
      );
      const model = this.store().createRecord('worship-service', {
        classification,
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 4);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        organizationStatus: { message: 'Selecteer een optie' },
        recognizedWorshipType: { message: 'Selecteer een optie' },
        scope: { message: 'Selecteer een optie' },
      });
    });

    test(`it should not return an extra error when editing an existing ${CLASSIFICATION.WORSHIP_SERVICE.label} with a membership`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.WORSHIP_SERVICE,
      );
      const membership = this.store().createRecord('membership');
      const model = this.store().createRecord('worship-service', {
        classification,
        memberships: [membership],
      });

      const isValid = await model.validate({ creatingNewOrganization: true });

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 4);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        organizationStatus: { message: 'Selecteer een optie' },
        recognizedWorshipType: { message: 'Selecteer een optie' },
        scope: { message: 'Selecteer een optie' },
      });
    });

    test('it validates the sum of the local involvements percentages', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.WORSHIP_SERVICE,
      );
      const recognizedWorshipType = this.store().createRecord(
        'recognized-worship-type',
        RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC,
      );
      const organizationStatus = this.store().createRecord(
        'organization-status-code',
        ORGANIZATION_STATUS.ACTIVE,
      );
      const localInvolvementA = this.store().createRecord('local-involvement', {
        percentage: 51,
      });
      const localInvolvementB = this.store().createRecord('local-involvement', {
        percentage: 50,
      });
      const scope = this.store().createRecord('location', {
        label: 'scope label',
        level: 'scope level',
      });
      const worshipService = this.store().createRecord('worship-service', {
        legalName: 'Foo',
        classification,
        organizationStatus,
        recognizedWorshipType,
        scope,
        involvements: [localInvolvementA, localInvolvementB],
      });

      let isValid = await worshipService.validate();

      assert.true(
        isValid,
        "it doesn't validate the involvement percentages by default",
      );

      isValid = await worshipService.validate({
        involvementsPercentage: true,
      });

      assert.false(isValid);
      assert.propContains(worshipService.error, {
        involvements: {
          message: 'Het totaal van alle percentages moet gelijk zijn aan 100',
        },
      });

      localInvolvementA.percentage = 50;
      isValid = await worshipService.validate({
        involvementsPercentage: true,
      });
      assert.true(isValid);
    });
  });

  module('classification', function () {
    test('it should return true for worship service', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.WORSHIP_SERVICE,
      );
      const model = this.store().createRecord('worship-service', {
        classification,
      });

      const result = model.isWorshipService;
      assert.true(result);
    });

    test(`it should return false for a representative body`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.REPRESENTATIVE_BODY,
      );
      const model = this.store().createRecord('worship-service', {
        classification,
      });

      const result = model.isRepresentativeBody;
      assert.notOk(result);
    });
  });
});
