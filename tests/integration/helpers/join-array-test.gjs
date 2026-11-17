import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | join-array', function (hooks) {
  setupRenderingTest(hooks);

  test('it converts an array to a string using the .join method', async function (assert) {
    await render(hbs`{{join-array (array "foo" "bar")}}`);
    assert
      .dom(this.element)
      .hasText('foo, bar', 'it defaults to ", " as the separator');
  });

  test('it accepts an optional separator', async function (assert) {
    await render(hbs`{{join-array (array "foo" "bar") " - "}}`);
    assert.dom(this.element).hasText('foo - bar');
  });
});
