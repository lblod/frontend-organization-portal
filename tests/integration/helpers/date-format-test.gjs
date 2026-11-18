import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import dateFormat from 'frontend-organization-portal/helpers/date-format';

module('Integration | Helper | date-format', function (hooks) {
  setupRenderingTest(hooks);

  test('It correctly formats date', async function (assert) {
    this.set('inputValue', new Date('2021-03-01'));

    await render(<template>{{dateFormat this.inputValue}}</template>);

    assert.strictEqual(this.element.textContent.trim(), '01-03-2021');
  });

  test('It correctly formats valide string date', async function (assert) {
    this.set('inputValue', '2021-03-01');

    await render(<template>{{dateFormat this.inputValue}}</template>);

    assert.strictEqual(this.element.textContent.trim(), '01-03-2021');
  });
});
