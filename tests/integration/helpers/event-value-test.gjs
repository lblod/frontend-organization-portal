import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import { on } from '@ember/modifier';
import eventValue from 'frontend-organization-portal/helpers/event-value.js';
import { fn } from '@ember/helper';

module('Integration | Helper | event-value', function (hooks) {
  setupRenderingTest(hooks);

  test('it calls the handler with the event value', async function (assert) {
    this.handler = (value) => {
      assert.step(value);
    };

    await render(
      <template>
        <label>
          <input {{on "change" (eventValue this.handler)}} />
        </label>
      </template>,
    );

    await fillIn('input', 'foo');
    assert.verifySteps(['foo']);
  });

  test('it works with fn + mut', async function (assert) {
    await render(
      <template>
        <label>
          <input {{on "change" (eventValue (fn (mut this.value)))}} />
        </label>
      </template>,
    );

    assert.strictEqual(this.value, undefined);
    await fillIn('input', 'foo');
    assert.strictEqual(this.value, 'foo');
  });
});
