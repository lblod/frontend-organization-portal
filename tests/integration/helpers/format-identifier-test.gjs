import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import formatIdentifier from 'frontend-organization-portal/helpers/format-identifier';

module('Integration | Helper | format-identifier', function (hooks) {
  setupRenderingTest(hooks);

  test('it returns an unchanged alphanumeric string', async function (assert) {
    this.set('inputValue', 'a1b2c3d4');
    await render(<template>{{formatIdentifier this.inputValue}}</template>);
    assert.dom(this.element).hasText('a1b2c3d4');
  });

  test('it filters special, non-alphanumeric, characters', async function (assert) {
    this.set('inputValue', '~a`1!b@2#c$3%d^4&e*5(f)6{g}7:h8;i 9');
    await render(<template>{{formatIdentifier this.inputValue}}</template>);
    assert.dom(this.element).hasText('a1b2c3d4e5f6g7h8i9');
  });
});
