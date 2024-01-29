import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';

export default class IsFeatureEnabledHelper extends Helper {
  @service features;

  compute(positional) {
    assert(
      'is-feature-enabled expects exactly one argument',
      positional.length === 1
    );
    return this.features.isEnabled(positional[0] || '');
  }
}
