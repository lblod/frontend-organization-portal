import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

module('Unit | Model | representative body', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns errors when model is empty', async function (assert) {
      const model = this.store().createRecord('representative-body');

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
    test('it should return true for a representative body', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.REPRESENTATIVE_BODY,
      );
      const model = this.store().createRecord('representative-body', {
        classification,
      });

      const result = model.isRepresentativeBody;
      assert.true(result);
    });

    [
      [CLASSIFICATION.CENTRAL_WORSHIP_SERVICE, 'isCentralWorshipService'],
      [CLASSIFICATION.WORSHIP_SERVICE, 'isWorshipService'],
    ].forEach(([cl, func]) => {
      test(`it should return false for ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('representative-body', {
          classification,
        });

        const result = model[func];
        assert.notOk(result);
      });
    });
  });
});
