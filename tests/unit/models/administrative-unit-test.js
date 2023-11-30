import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | administrative unit', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns errors when model is empty', async function (assert) {
      const model = this.store().createRecord('administrative-unit');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        name: 'Vul de naam in',
        classification: 'Selecteer een optie',
      });
    });
  });
});
