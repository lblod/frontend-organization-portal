import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';

module('Unit | Route | organizations/new', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:organizations/new');
    assert.ok(route);
  });
});
