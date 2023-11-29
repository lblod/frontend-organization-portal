import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { attr, hasMany, belongsTo } from '@ember-data/model';
import { array, object, string } from 'yup';
import AbstractValidationModel from 'frontend-organization-portal/models/abstract-validation-model';

module('Unit | Model | abstract validation model', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('attribute validation', function () {
    test('it returns null when schema is valid', async function (assert) {
      this.owner.register('model:test-validation-model', BasicValidationModel);
      const model = this.store().createRecord('test-validation-model', {
        name: 'test',
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.strictEqual(model.error, null);
    });

    test('it returns default error message when name is missing', async function (assert) {
      this.owner.register('model:test-validation-model', BasicValidationModel);
      const model = this.store().createRecord('test-validation-model');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        name: 'name is a required field',
      });
    });
  });

  module('belongTo validation', function () {
    test('it returns error when required belongTo is missing', async function (assert) {
      this.owner.register(
        'model:test-validation-model',
        BelongToValidationModel
      );
      const model = this.store().createRecord('test-validation-model');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        oneRequired: 'Selecteer een optie',
      });
    });

    test('it returns error when belongTo has error', async function (assert) {
      this.owner.register(
        'model:test-validation-model',
        BelongToValidationModel
      );
      const oneRequired = this.store().createRecord('test-validation-model');
      const model = this.store().createRecord('test-validation-model', {
        oneRequired,
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        oneRequired: {
          oneRequired: 'Selecteer een optie',
        },
      });
    });
  });

  module('hasMany validation', function () {
    test('it returns error when required hasMany is missing', async function (assert) {
      this.owner.register(
        'model:test-validation-model',
        HasManyValidationModel
      );
      const model = this.store().createRecord('test-validation-model');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        manyRequired: 'Selecteer een optie',
      });
    });

    test('it returns error when required hasMany has error', async function (assert) {
      this.owner.register(
        'model:test-validation-model',
        HasManyValidationModel
      );
      const manyRequired = this.store().createRecord('test-validation-model');
      const model = this.store().createRecord('test-validation-model');
      model.manyRequired.pushObject(manyRequired);

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        manyRequired: {
          manyRequired: 'Selecteer een optie',
        },
      });
    });
  });
});

class BasicValidationModel extends AbstractValidationModel {
  @attr name;

  get validationSchema() {
    return object().shape({
      name: string().required(),
    });
  }
}

class BelongToValidationModel extends AbstractValidationModel {
  @belongsTo('test-validation-model', {
    inverse: null,
  })
  oneRequired;

  @belongsTo('test-validation-model', {
    inverse: null,
  })
  oneOptional;

  get validationSchema() {
    return object().shape({
      oneRequired: object().relationship({
        isRequired: true,
        message: 'Selecteer een optie',
      }),
      oneOptional: object().relationship(),
    });
  }
}

class HasManyValidationModel extends AbstractValidationModel {
  @hasMany('test-validation-model', {
    inverse: null,
  })
  manyRequired;

  @hasMany('test-validation-model', {
    inverse: null,
  })
  manyOptional;

  get validationSchema() {
    return object().shape({
      manyRequired: array().relationship({
        isRequired: true,
        message: 'Selecteer een optie',
      }),
      manyOptional: array().relationship(),
    });
  }
}
