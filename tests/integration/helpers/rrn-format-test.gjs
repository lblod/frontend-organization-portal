import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import rrnFormat from 'frontend-organization-portal/helpers/rrn-format';

module('Integration | Helper | rrn-format', function (hooks) {
  setupRenderingTest(hooks);

  test('it returns empty string when value not valid', async function (assert) {
    this.set('inputValue', '1234');

    await render(<template>{{rrnFormat this.inputValue}}</template>);

    assert.strictEqual(this.element.textContent.trim(), '');
  });

  test('it returns formated string when value has 10 characters', async function (assert) {
    this.set('inputValue', '00123456789');

    await render(<template>{{rrnFormat this.inputValue}}</template>);

    assert.strictEqual(this.element.textContent.trim(), '00.12.34-567.89');
  });
});
