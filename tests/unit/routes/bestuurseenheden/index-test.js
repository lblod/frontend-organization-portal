import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | bestuurseenheden/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:bestuurseenheden/index');
    assert.ok(route);
  });
});
