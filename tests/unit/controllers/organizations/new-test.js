import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';

module('Unit | Controller | organizations/new', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:organizations/new');
    assert.ok(controller);
  });
});
