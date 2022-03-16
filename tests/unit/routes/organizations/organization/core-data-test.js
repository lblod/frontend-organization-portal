import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | organizations/organization/core-data', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:organizations/organization/core-data');
    assert.ok(route);
  });
});
