import sinon from 'sinon';

/**
 * Put the feature flags in a fixed state for a test, replacing whatever the
 * test environment configured in `config/environment.js`.
 *
 * @param {Owner} owner - the test owner (`this.owner`)
 * @param {Object<string, boolean>} features - flag name to value
 */
export function setFeatures(owner, features) {
  owner.lookup('service:features').setup(features);
}

/**
 * Stub `service:router`'s `transitionTo` so a route's `beforeModel` can be
 * called without navigating.
 *
 * @param {Owner} owner - the test owner (`this.owner`)
 * @returns {sinon.SinonStub} the stub, returning its arguments
 */
export function stubTransitionTo(owner) {
  return sinon
    .stub(owner.lookup('service:router'), 'transitionTo')
    .returnsArg(0);
}
