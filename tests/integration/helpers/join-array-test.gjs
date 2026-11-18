import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { render } from '@ember/test-helpers';
import joinArray from 'frontend-organization-portal/helpers/join-array';
import { array } from '@ember/helper';

module('Integration | Helper | join-array', function (hooks) {
  setupRenderingTest(hooks);

  test('it converts an array to a string using the .join method', async function (assert) {
    await render(<template>{{joinArray (array "foo" "bar")}}</template>);
    assert
      .dom(this.element)
      .hasText('foo, bar', 'it defaults to ", " as the separator');
  });

  test('it accepts an optional separator', async function (assert) {
    await render(<template>{{joinArray (array "foo" "bar") " - "}}</template>);
    assert.dom(this.element).hasText('foo - bar');
  });
});
