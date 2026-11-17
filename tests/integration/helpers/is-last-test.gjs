import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | is-last', function (hooks) {
  setupRenderingTest(hooks);

  test('it determines if the passed in item is the last item of an array', async function (assert) {
    this.list = [1, 2, 3];
    this.currentItem = 1;

    await render(hbs`
      {{is-last this.currentItem this.list}}
    `);

    assert.strictEqual(this.element.textContent.trim(), 'false');

    this.set('currentItem', 3);
    assert.strictEqual(this.element.textContent.trim(), 'true');

    this.set('list', [10, 11]);
    assert.strictEqual(this.element.textContent.trim(), 'false');

    this.set('currentItem', 11);
    assert.strictEqual(this.element.textContent.trim(), 'true');
  });

  test('it works with an array of objects', async function (assert) {
    this.list = [
      {
        label: 'foo',
      },
      {
        label: 'bar',
      },
    ];
    this.currentItem = this.list[0];

    await render(hbs`
      {{is-last this.currentItem this.list}}
    `);

    assert.strictEqual(this.element.textContent.trim(), 'false');

    this.set('currentItem', this.list[1]);
    assert.strictEqual(this.element.textContent.trim(), 'true');
  });

  test('it always returns false when the list is empty', async function (assert) {
    this.list = [];
    this.currentItem = 'foo';

    await render(hbs`
      {{is-last this.currentItem this.list}}
    `);

    assert.strictEqual(this.element.textContent.trim(), 'false');
  });
});
