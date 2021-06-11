import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | worship mandatory', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('worship-mandatory', {});
    assert.ok(model);
  });
});
