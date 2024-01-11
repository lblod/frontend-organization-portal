import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

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
      assert.strictEqual(Object.keys(model.error).length, 3);
      console.log(model.error);
      assert.propContains(model.error, {
        name: { message: 'Vul de naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
      });
    });
  });
});