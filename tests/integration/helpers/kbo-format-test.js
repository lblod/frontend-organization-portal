import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | kbo-format', function (hooks) {
  setupRenderingTest(hooks);

  test('It correctly formats KBO number', async function (assert) {
    this.set('inputValue', '0123456789');

    await render(hbs`{{kbo-format inputValue}}`);

    assert.equal(this.element.textContent.trim(), '0123.456.789');
  });

  test('Returns an empty string for an input that is too short', async function (assert) {
    this.set('inputValue', '012345');

    await render(hbs`{{kbo-format inputValue}}`);

    assert.equal(this.element.textContent.trim(), '');
  });

  test('Returns an empty string for an input that is too long', async function (assert) {
    this.set('inputValue', '01234567891011');

    await render(hbs`{{kbo-format inputValue}}`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
