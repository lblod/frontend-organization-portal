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

  module('phone validation', function () {
    test('it returns true when phone is empty', async function (assert) {
      this.owner.register('model:test-validation-model', PhoneValidationModel);
      const model = this.store().createRecord('test-validation-model', {});

      const isValid = await model.validate();

      assert.true(isValid);
      assert.deepEqual(model.error, null);
    });

    test('it returns true when phone is valid', async function (assert) {
      this.owner.register('model:test-validation-model', PhoneValidationModel);
      const model = this.store().createRecord('test-validation-model', {
        phone: '+32412345678',
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.deepEqual(model.error, null);
    });

    test('it returns error when phone number is wrong', async function (assert) {
      this.owner.register('model:test-validation-model', PhoneValidationModel);
      const model = this.store().createRecord('test-validation-model', {
        phone: ':32477',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        phone: 'Phone is wrong',
      });
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
      assert.deepEqual(model.error, null);
    });

    test('It returns true when one is not filled in', async function (assert) {
      this.owner.register('model:test-validation-model', RequireWhenAllModel);
      const model = this.store().createRecord('test-validation-model', {
        one: 'one',
      });

      const isValid = await model.validate();

      assert.true(isValid);
      assert.deepEqual(model.error, null);
    });

    test('it returns error when dependcies are filled and required is missing', async function (assert) {
      this.owner.register('model:test-validation-model', RequireWhenAllModel);
      const model = this.store().createRecord('test-validation-model', {
        one: 'one',
        three: 'three',
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.deepEqual(model.error, {
        two: 'two is required',
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

class PhoneValidationModel extends AbstractValidationModel {
  @attr phone;

  get validationSchema() {
    return object().shape({
      phone: string().phone('Phone is wrong'),
    });
  }
}

class RequireWhenAllModel extends AbstractValidationModel {
  @attr one;
  @attr two;
  @attr three;

  get validationSchema() {
    return object().shape({
      two: string().requiredWhenAll(['one', 'three']),
    });
  }
}
