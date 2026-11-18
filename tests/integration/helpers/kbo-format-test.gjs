import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import kboFormat from 'frontend-organization-portal/helpers/kbo-format';

module('Integration | Helper | kbo-format', function (hooks) {
  setupRenderingTest(hooks);

  test('It correctly formats KBO number', async function (assert) {
    this.set('inputValue', '0123456789');

    await render(<template>{{kboFormat this.inputValue}}</template>);

    assert.strictEqual(this.element.textContent.trim(), '0123.456.789');
  });

  test('Returns an empty string for an input that is too short', async function (assert) {
    this.set('inputValue', '012345');

    await render(<template>{{kboFormat this.inputValue}}</template>);

    assert.strictEqual(this.element.textContent.trim(), '');
  });

  test('Returns an empty string for an input that is too long', async function (assert) {
    this.set('inputValue', '01234567891011');

    await render(<template>{{kboFormat this.inputValue}}</template>);

    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
