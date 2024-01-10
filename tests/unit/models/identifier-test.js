import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { A } from '@ember/array';

module('Unit | Model | identifier', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    test('it returns error when identifier is empty', async function (assert) {
      const model = this.store().createRecord('identifier', {});

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        idName: { message: '"idName" is required' },
        structuredIdentifier: { message: '"structuredIdentifier" is required' },
      });
    });

    test('it returns error when idName is not valid', async function (assert) {
      const model = this.store().createRecord('identifier', {
        idName: 'invalid',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        idName: {
          message:
            '"idName" must be one of [KBO nummer, SharePoint identificator, Rijksregisternummer, NIS code, OVO-nummer]',
        },
        structuredIdentifier: { message: '"structuredIdentifier" is required' },
      });
    });

    module('KBO nummer', function () {
      test('it returns error when localId is empty', async function (assert) {
        const structuredIdentifier = this.store().createRecord(
          'structured-identifier'
        );
        const model = this.store().createRecord('identifier', {
          idName: 'KBO nummer',
          structuredIdentifier,
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 1);
        assert.strictEqual(
          model.error.structuredIdentifier.message,
          'Vul het KBO nummer in'
        );
      });

      test('it returns error when localId is wrong', async function (assert) {
        const structuredIdentifier = this.store().createRecord(
          'structured-identifier',
          {
            localId: '123',
          }
        );
        const model = this.store().createRecord('identifier', {
          idName: 'KBO nummer',
          structuredIdentifier,
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 1);
        assert.strictEqual(
          model.error.structuredIdentifier.message,
          'Vul het (tiencijferige) KBO nummer in.'
        );
      });

      test('it do not check if already exist when value have not changed', async function (assert) {
        const structuredIdentifier = this.store().createRecord(
          'structured-identifier',
          {
            localId: '0123456789',
          }
        );
        const model = this.store().createRecord('identifier', {
          idName: 'KBO nummer',
          structuredIdentifier,
        });
        const stub = sinon.stub(structuredIdentifier, 'changedAttributes');
        stub.returns({});

        const isValid = await model.validate();

        stub.restore();

        assert.true(isValid);
        assert.strictEqual(model.error, undefined);
      });

      test('it checks if already exist when value have changed', async function (assert) {
        const structuredIdentifier = this.store().createRecord(
          'structured-identifier',
          {
            localId: '0123456789',
          }
        );
        const model = this.store().createRecord('identifier', {
          idName: 'KBO nummer',
          structuredIdentifier,
        });
        const queryStub = sinon.stub(
          this.owner.lookup('service:store'),
          'query'
        );
        queryStub.resolves(A([]));

        const isValid = await model.validate();

        assert.true(isValid);
        assert.strictEqual(model.error, undefined);

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
        const structuredIdentifier = this.store().createRecord(
          'structured-identifier',
          {
            localId: '0123456789',
          }
        );
        const model = this.store().createRecord('identifier', {
          idName: 'KBO nummer',
          structuredIdentifier,
        });
        const queryStub = sinon.stub(
          this.owner.lookup('service:store'),
          'query'
        );
        queryStub.resolves(A([adminstrativeUnit]));

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 1);
        assert.strictEqual(
          model.error.structuredIdentifier.message,
          'Dit KBO nummer is al in gebruik.'
        );
        assert.strictEqual(
          model.error.structuredIdentifier.context.administrativeUnit.id,
          adminstrativeUnit.id
        );

        queryStub.restore();
      });
    });

    module('SharePoint identificator', function () {
      test('it returns no error when localId is empty', async function (assert) {
        const structuredIdentifier = this.store().createRecord(
          'structured-identifier'
        );
        const model = this.store().createRecord('identifier', {
          idName: 'SharePoint identificator',
          structuredIdentifier,
        });

        const isValid = await model.validate();

        assert.true(isValid);
      });

      test('it returns error when localId is not a number', async function (assert) {
        const structuredIdentifier = this.store().createRecord(
          'structured-identifier',
          {
            localId: 'abc',
          }
        );
        const model = this.store().createRecord('identifier', {
          idName: 'SharePoint identificator',
          structuredIdentifier,
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 1);
        assert.strictEqual(
          model.error.structuredIdentifier.message,
          'De SharePoint identificator mag enkel cijfers bevatten'
        );
      });
    });
  });
});
