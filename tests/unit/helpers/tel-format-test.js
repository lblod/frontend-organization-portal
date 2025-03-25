import telFormat from 'frontend-organization-portal/helpers/tel-format';
import { module, test } from 'qunit';

module('Unit | Helper | tel-format', function () {
  test('it formats phone numbers into a human readable format', function (assert) {
    assert.strictEqual(
      telFormat('+3221524562'),
      '+32 21 52 45 62',
      'it supports phone numbers with a + country prefix',
    );
    assert.strictEqual(
      telFormat('+32482455642'),
      '+32 482 45 56 42',
      'it supports phone numbers with a + country prefix',
    );
    assert.strictEqual(
      telFormat('003221524562'),
      '+32 21 52 45 62',
      'it supports phone numbers with a 00 country prefix',
    );
    assert.strictEqual(
      telFormat('0032482455642'),
      '+32 482 45 56 42',
      'it supports phone numbers with a 00 country prefix',
    );
    assert.strictEqual(
      telFormat('021524562'),
      '+32 21 52 45 62',
      'it supports phone numbers without a country prefix',
    );
    assert.strictEqual(
      telFormat('0482455642'),
      '+32 482 45 56 42',
      'it supports phone numbers without a country prefix',
    );
  });

  test('it ignores different formatting patterns', function (assert) {
    assert.strictEqual(telFormat('021/52.45.62'), '+32 21 52 45 62');
    assert.strictEqual(telFormat('0482/45 56 42'), '+32 482 45 56 42');
    assert.strictEqual(telFormat('021 524 562'), '+32 21 52 45 62');
    assert.strictEqual(telFormat('0 2 1 5 2 4 5 6 2'), '+32 21 52 45 62');
    assert.strictEqual(telFormat('0482 45 56 42'), '+32 482 45 56 42');
  });

  test('it supports special phone numbers', function (assert) {
    assert.strictEqual(
      telFormat('1733'),
      '1733',
      'it supports the special, 4 digit numbers',
    );
    assert.strictEqual(
      telFormat('08001080'),
      '0800 10 80',
      'it supports the special 0800 numbers with an even amount of digits',
    );
    assert.strictEqual(
      telFormat('080010800'),
      '0800 10 800',
      'it supports the special 0800 numbers with an odd amount of digits',
    );
  });

  test('it returns an empty string if a falsy value is provided', function (assert) {
    assert.strictEqual(telFormat(undefined), '');
    assert.strictEqual(telFormat(''), '');
  });

  test('it returns irregular phone numbers unchanged', function (assert) {
    assert.strictEqual(
      telFormat('012 345'),
      '012 345',
      'it returns irregularly short phone numbers as-is',
    );

    assert.strictEqual(
      telFormat('012 345 67 81 23 28'),
      '012 345 67 81 23 28',
      'it returns irregularly long phone numbers as-is',
    );
  });

  test('it asserts the correct amount of arguments', function (assert) {
    assert.throws(() => {
      telFormat();
    }, /expected a single phone number string/);

    assert.throws(() => {
      telFormat('1', '2');
    }, /expected a single phone number string/);
  });

  test('it asserts the type of the phone number argument', function (assert) {
    assert.throws(() => {
      telFormat(1234);
    }, /The first argument must be a phone number string/);
  });
});
