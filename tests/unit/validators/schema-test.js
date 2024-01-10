import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  validatePhone,
  validateEmail,
  validateUrl,
} from 'frontend-organization-portal/validators/schema';

module('Unit | Validator | schema', function (hooks) {
  setupTest(hooks);

  module('validatePhone', function () {
    test('it returns no error when phone is undefined', function (assert) {
      const { error } = validatePhone().validate();

      assert.strictEqual(error, undefined);
    });

    test('it returns no error when phone is empty string', function (assert) {
      const { error } = validatePhone().validate('');

      assert.strictEqual(error, undefined);
    });

    test('it returns no error when phone is valid', function (assert) {
      const { error } = validatePhone().validate('+32412345678');

      assert.strictEqual(error, undefined);
    });

    test('it returns error when phone number is wrong', function (assert) {
      const { error } = validatePhone('Phone is wrong').validate(':32477');

      assert.strictEqual(error.details[0].message, 'Phone is wrong');
    });
  });

  module('validateEmail', function () {
    test('it returns no error when email is undefined', function (assert) {
      const { error } = validateEmail().validate();

      assert.strictEqual(error, undefined);
    });

    test('it returns no error when email is empty string', function (assert) {
      const { error } = validateEmail().validate('');

      assert.strictEqual(error, undefined);
    });

    test('it returns no error when email is valid', function (assert) {
      const { error } = validateEmail().validate('test@test.com');

      assert.strictEqual(error, undefined);
    });

    test('it returns error when email is wrong', function (assert) {
      const { error } = validateEmail('Email is wrong').validate('test@test');

      assert.strictEqual(error.details[0].message, 'Email is wrong');
    });
  });

  module('validateUrl', function () {
    test('it returns no error when url is undefined', function (assert) {
      const { error } = validateUrl().validate();

      assert.strictEqual(error, undefined);
    });

    test('it returns no error when url is empty string', function (assert) {
      const { error } = validateUrl().validate('');

      assert.strictEqual(error, undefined);
    });

    test('it returns no error when url is valid', function (assert) {
      const { error } = validateUrl().validate('https://www.vlaanderen.be/');

      assert.strictEqual(error, undefined);
    });

    test('it returns error when url is wrong', function (assert) {
      const { error } = validateUrl('URL is wrong').validate('test@test');

      assert.strictEqual(error.details[0].message, 'URL is wrong');
    });
  });
});
