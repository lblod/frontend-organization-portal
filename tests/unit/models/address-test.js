import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | address', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns error when street is missing', async function (assert) {
      const model = this.store().createRecord('address', {
        number: '1',
        postcode: '1000',
        municipality: 'Brussel',
        province: 'Brussel',
        country: 'België',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(
        model.error.street.message,
        'Vul het volledige adres in'
      );
    });

    test('it returns no error when country in Frans and province is missing', async function (assert) {
      const model = this.store().createRecord('address', {
        number: '5',
        street: 'Rue des Messageries',
        postcode: '75010',
        municipality: 'Paris',
        country: 'Frankrijk',
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.strictEqual(model.error, undefined);
    });

    test('it returns error when country is België and province is missing', async function (assert) {
      const model = this.store().createRecord('address', {
        number: '1',
        street: 'Wetstraat',
        postcode: '1000',
        municipality: 'Brussel',
        country: 'België',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(
        model.error.province.message,
        'Vul het volledige adres in'
      );
    });
  });
});
