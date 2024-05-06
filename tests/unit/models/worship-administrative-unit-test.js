import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

module('Unit | Model | worship administrative unit', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns error when model is empty', async function (assert) {
      const model = this.store().createRecord('worship-administrative-unit');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 4);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
        recognizedWorshipType: { message: 'Selecteer een optie' },
      });
    });
  });

  module('classification', function () {
    test(`it should return true for worship service`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.WORSHIP_SERVICE
      );
      const model = this.store().createRecord('worship-service', {
        classification,
      });

      const result = model.isWorshipAdministrativeUnit;
      assert.true(result);
    });

    test(`it should return true for a central worship service`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE
      );
      const model = this.store().createRecord('central-worship-service', {
        classification,
      });

      const result = model.isWorshipAdministrativeUnit;
      assert.true(result);
    });

    test('it should return false for a representative body', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.REPRESENTATIVE_BODY
      );
      const model = this.store().createRecord('representative-body', {
        classification,
      });

      const result = model.isWorshipAdministrativeUnit;
      assert.notOk(result);
    });
  });
});
