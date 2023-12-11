import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | address', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns no error when model is empty', async function (assert) {
      const model = this.store().createRecord('address');

      const isValid = await model.validate();

      assert.true(isValid);
      assert.deepEqual(model.error, null);
    });

    test('it returns error when street is undefined, but dependency fulfilled', async function (assert) {
      const model = this.store().createRecord('address', {
        number: '1',
        postcode: '1000',
        municipality: 'Brussel',
        province: 'Brussel',
        country: 'België',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        street: 'Vul het volledige adres in',
      });
    });

    test('it returns error when België and province is missing', async function (assert) {
      const model = this.store().createRecord('address', {
        country: 'België',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        province: 'Vul het volledige adres in',
      });
    });
  });
});
