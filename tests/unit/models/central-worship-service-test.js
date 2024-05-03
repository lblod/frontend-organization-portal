import { module, test } from 'qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

import { setupTest } from 'frontend-organization-portal/tests/helpers';

module('Unit | Model | central worship service', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns errors when model is empty', async function (assert) {
      const model = this.store().createRecord('central-worship-service');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 3);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
      });
    });
  });

  module('classification', function () {
    test('it should return true for central worship service', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE
      );
      const model = this.store().createRecord('central-worship-service', {
        classification,
      });

      const result = model.isCentralWorshipService;
      assert.true(result);
    });
  });
});
