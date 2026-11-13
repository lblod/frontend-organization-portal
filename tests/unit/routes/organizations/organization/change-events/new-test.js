import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import {
  setFeatures,
  stubTransitionTo,
} from 'frontend-organization-portal/tests/helpers/feature-flags';
import NewRoute from 'frontend-organization-portal/routes/organizations/organization/change-events/new';

module(
  'Unit | Route | organizations/organization/change-events/new',
  function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
      this.owner.register(
        'route:organizations/organization/change-events/new',
        NewRoute,
      );
      this.owner.lookup('service:role')._activeRole =
        'ABBOrganisatiePortaalGebruiker-editeerder';
    });

    this.route = function () {
      return this.owner.lookup(
        'route:organizations/organization/change-events/new',
      );
    };

    test('it redirects non-worship users to the change events list when the flag is on', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(
        transitionTo.calledOnceWith('organizations.organization.change-events'),
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

    test('it does not redirect when the flag is off', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': false });
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(transitionTo.notCalled);
    });
  },
);
