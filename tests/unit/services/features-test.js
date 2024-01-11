import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | features', function (hooks) {
  setupTest(hooks);

  this.subject = function () {
    return this.owner.lookup('service:features');
  };

  module('isEnabled', function () {
    test('it returns true when the feature is enabled', function (assert) {
      const features = this.subject();
      features.setup({ test: true });

      assert.true(features.isEnabled('test'));
    });

    test('it return false when the feature is disabled', function (assert) {
      const features = this.subject();
      features.setup({ test: false });

      assert.false(features.isEnabled('test'));
    });

    test('it throws when the feature is not configured', function (assert) {
      const features = this.subject();

      assert.throws(() => features.isEnabled('test'));
    });
  });
});
