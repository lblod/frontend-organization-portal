import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | contact point', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns no error when model is empty', async function (assert) {
      const model = this.store().createRecord('contact-point');

      const isValid = await model.validate();

      assert.true(isValid);
      assert.deepEqual(model.error, undefined);
    });
  });
});
