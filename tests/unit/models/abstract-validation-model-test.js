import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { attr, hasMany, belongsTo } from '@ember-data/model';
import Joi from 'joi';
import AbstractValidationModel from 'frontend-organization-portal/models/abstract-validation-model';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
  validateHasManyRequired,
  validateRequiredWhenAll,
} from 'frontend-organization-portal/validators/schema';

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
      assert.strictEqual(model.error.name.message, '"name" is required');
    });

    test('it reset error when attribute is filled in', async function (assert) {
      this.owner.register('model:test-validation-model', BasicValidationModel);
      const model = this.store().createRecord('test-validation-model');
      await model.validate();
      assert.strictEqual(
        model.error.name.message,
        '"name" is required',
        'error is set'
      );

      model.name = 'test';
      await model.validate();

      assert.strictEqual(model.error, null, 'error is reset');
    });
  });

  module('belongsTo validation', function () {
    test('it returns an error when required belongsTo is missing', async function (assert) {
      this.owner.register(
        'model:test-validation-model',
        BelongsToValidationModel
      );
      const model = this.store().createRecord('test-validation-model');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(
        model.error.oneRequired.message,
        'Selecteer een optie'
      );
    });

    test('it returns no error when required belongsTo is fulfilled', async function (assert) {
      this.owner.register(
        'model:test-validation-model',
        BelongsToValidationModel
      );
      const oneRequired = this.store().createRecord('test-validation-model');
      const model = this.store().createRecord('test-validation-model', {
        oneRequired,
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.strictEqual(model.error, null);
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
      assert.strictEqual(
        model.error.manyRequired.message,
        'Selecteer een optie'
      );
    });

    test('it returns no error when required hasMany is fulfilled', async function (assert) {
      this.owner.register(
        'model:test-validation-model',
        HasManyValidationModel
      );
      const manyRequired = this.store().createRecord('test-validation-model');
      const model = this.store().createRecord('test-validation-model');
      model.manyRequired.pushObject(manyRequired);

      const isValid = await model.validate();

      assert.true(isValid);
      assert.strictEqual(model.error, null);
    });
  });

  module('required when all', function () {
    test('it returns true when all required attributes are filled in', async function (assert) {
      this.owner.register('model:test-validation-model', RequireWhenAllModel);
      const model = this.store().createRecord('test-validation-model', {
        one: 'one',
        two: 'two',
        three: 'three',
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.strictEqual(model.error, null);
    });

    test('It returns true when one is not filled in', async function (assert) {
      this.owner.register('model:test-validation-model', RequireWhenAllModel);
      const model = this.store().createRecord('test-validation-model', {
        one: 'one',
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.strictEqual(model.error, null);
    });

    test('It returns true when all are missing', async function (assert) {
      this.owner.register('model:test-validation-model', RequireWhenAllModel);
      const model = this.store().createRecord('test-validation-model', {});

      const isValid = await model.validate();

      assert.true(isValid);
      assert.strictEqual(model.error, null);
    });

    test('it returns error when dependcies are filled and required is missing', async function (assert) {
      this.owner.register('model:test-validation-model', RequireWhenAllModel);
      const model = this.store().createRecord('test-validation-model', {
        one: 'one',
        three: 'three',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(model.error.two.message, 'two is required');
    });
  });
});

class BasicValidationModel extends AbstractValidationModel {
  @attr name;

  get validationSchema() {
    return Joi.object({
      name: Joi.string().required(),
    });
  }
}

class BelongsToValidationModel extends AbstractValidationModel {
  @belongsTo('test-validation-model', {
    inverse: null,
  })
  oneRequired;

  @belongsTo('test-validation-model', {
    inverse: null,
  })
  oneOptional;

  get validationSchema() {
    return Joi.object({
      oneRequired: validateBelongsToRequired('Selecteer een optie'),
      oneOptional: validateBelongsToOptional(),
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
    return Joi.object({
      manyRequired: validateHasManyRequired('Selecteer een optie'),
      manyOptional: validateHasManyOptional(),
    });
  }
}

class RequireWhenAllModel extends AbstractValidationModel {
  @attr one;
  @attr two;
  @attr three;

  get validationSchema() {
    return Joi.object({
      one: Joi.string(),
      two: validateRequiredWhenAll(['one', 'three'], 'two is required'),
      three: Joi.string(),
    });
  }
}
