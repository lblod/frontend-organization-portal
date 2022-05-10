import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module(
  'Unit | Controller | organizations/organization/related-organizations',
  function (hooks) {
    setupTest(hooks);

    // TODO: Replace this with your real tests.
    test('it exists', function (assert) {
      let controller = this.owner.lookup(
        'controller:organizations/organization/related-organizations'
      );
      assert.ok(controller);
    });
  }
);
