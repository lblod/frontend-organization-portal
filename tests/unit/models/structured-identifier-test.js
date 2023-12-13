import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { A } from '@ember/array';

module('Unit | Model | structured identifier', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns error when localId is empty', async function (assert) {
      const model = this.store().createRecord('structured-identifier');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(model.error.localId.message, 'Vul het KBO nummer in');
    });

    test('it returns error when localId is wrong', async function (assert) {
      const model = this.store().createRecord('structured-identifier', {
        localId: '123',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(
        model.error.localId.message,
        'Vul het (tiencijferige) KBO nummer in.'
      );
    });

    test('it do not check if already exist when value have not changed', async function (assert) {
      const model = this.store().createRecord('structured-identifier', {
        localId: '0123456789',
      });
      const stub = sinon.stub(model, 'changedAttributes');
      stub.returns({});

      const isValid = await model.validate();

      stub.restore();

      assert.true(isValid);
      assert.strictEqual(model.error, null);
    });

    test('it checks if already exist when value have changed', async function (assert) {
      const model = this.store().createRecord('structured-identifier', {
        localId: '0123456789',
      });
      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([]));

      const isValid = await model.validate();

      assert.true(isValid);
      assert.strictEqual(model.error, null);

      queryStub.restore();
    });

    test('it returns error when localId is already used', async function (assert) {
      const adminstrativeUnit = this.store().createRecord(
        'administrative-unit',
        {
          id: '1',
          localId: '0123456789',
        }
      );
      const model = this.store().createRecord('structured-identifier', {
        localId: '0123456789',
      });
      const queryStub = sinon.stub(this.owner.lookup('service:store'), 'query');
      queryStub.resolves(A([adminstrativeUnit]));

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(
        model.error.localId.message,
        'Dit KBO nummer is al in gebruik.'
      );
      assert.strictEqual(
        model.error.localId.context.administrativeUnit.id,
        adminstrativeUnit.id
      );

      queryStub.restore();
    });
  });
});
