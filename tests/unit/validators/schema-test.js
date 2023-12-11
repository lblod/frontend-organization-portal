import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  validatePhone,
  validateEmail,
} from 'frontend-organization-portal/validators/schema';

module('Unit | Validator | schema', function (hooks) {
  setupTest(hooks);

  module('validatePhone validation', function () {
    test('it returns true when phone is empty', function (assert) {
      const { error } = validatePhone().validate();

      assert.strictEqual(error, undefined);
    });

    test('it returns true when phone is valid', function (assert) {
      const { error } = validatePhone().validate('+32412345678');

      assert.strictEqual(error, undefined);
    });

    test('it returns error when phone number is wrong', function (assert) {
      const { error } = validatePhone('Phone is wrong').validate(':32477');

      assert.strictEqual(error.details[0].message, 'Phone is wrong');
    });
  });

  module('validateEmail validation', function () {
    test('it returns true when email is empty', function (assert) {
      const { error } = validateEmail().validate();

      assert.strictEqual(error, undefined);
    });

    test('it returns true when email is valid', function (assert) {
      const { error } = validateEmail().validate('test@test.com');

      assert.strictEqual(error, undefined);
    });

    test('it returns error when email is wrong', function (assert) {
      const { error } = validateEmail('Email is wrong').validate('test@test');

      assert.strictEqual(error.details[0].message, 'Email is wrong');
    });
  });
});
