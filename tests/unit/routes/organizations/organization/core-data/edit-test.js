import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import {
  setFeatures,
  stubTransitionTo,
} from 'frontend-organization-portal/tests/helpers/feature-flags';
import EditRoute from 'frontend-organization-portal/routes/organizations/organization/core-data/edit';

module(
  'Unit | Route | organizations/organization/core-data/edit',
  function (hooks) {
    setupTest(hooks);

    // The organizations routes are built into a lazy bundle (`splitAtRoutes`
    // in ember-cli-build.js), so the route must be registered before the
    // owner can look it up.
    hooks.beforeEach(function () {
      this.owner.register(
        'route:organizations/organization/core-data/edit',
        EditRoute,
      );
      this.owner.lookup('service:role')._activeRole =
        'ABBOrganisatiePortaalGebruiker-editeerder';
    });

    this.route = function () {
      return this.owner.lookup(
        'route:organizations/organization/core-data/edit',
      );
    };

    test('it redirects non-worship users to the read view when the flag is on', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(
        transitionTo.calledOnceWith('organizations.organization.core-data'),
      );
    });

    test('it does not redirect worship users when the flag is on', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
      this.owner.lookup('service:role')._activeRole =
        'ABBOrganisatiePortaalErediensten-editeerder';
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(transitionTo.notCalled);
    });

    test('it redirects readers to the unauthorized page, not the read view, when the flag is on', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
      this.owner.lookup('service:role')._activeRole =
        'ABBOrganisatiePortaalGebruiker-lezer';
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(transitionTo.calledOnceWith('unauthorized'));
    });

    test('it does not redirect when the flag is off', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': false });
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(transitionTo.notCalled);
    });
  },
);
