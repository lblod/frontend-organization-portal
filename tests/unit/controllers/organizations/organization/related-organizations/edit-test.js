/* eslint-disable warp-drive/no-legacy-request-patterns -- TODO: remove this once we have an alternative for peekRecord and peekAll */
import { module, test } from 'qunit';
import { settled } from '@ember/test-helpers';
import { recordIdentifierFor } from '@warp-drive/core';
import { saveRecord } from '@warp-drive/legacy/compat/builders';
import sinon from 'sinon';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import EditController from 'frontend-organization-portal/controllers/organizations/organization/related-organizations/edit';

module(
  'Unit | Controller | organizations/organization/related-organizations/edit',
  function (hooks) {
    setupTest(hooks);

    // The organizations routes are built into a lazy bundle (`splitAtRoutes`
    // in ember-cli-build.js), so the controller must be registered before the
    // owner can look it up.
    hooks.beforeEach(function () {
      this.owner.register(
        'controller:organizations/organization/related-organizations/edit',
        EditController,
      );
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    this.store = function () {
      return this.owner.lookup('service:store');
    };

    this.controller = function () {
      return this.owner.lookup(
        'controller:organizations/organization/related-organizations/edit',
      );
    };

    /**
     * Push a persisted organization and a persisted membership with another
     * organization into the store, as the edit route would have loaded them.
     * When `period` is given, a persisted period with these dates is linked
     * to the membership.
     */
    function pushOrganizationWithMembership(store, { period } = {}) {
      const [organization, , , membership] = store.push({
        data: [
          {
            type: 'organization',
            id: 'organization',
            attributes: { name: 'Organisatie' },
          },
          {
            type: 'organization',
            id: 'member',
            attributes: { name: 'Lid' },
          },
          {
            type: 'membership-role',
            id: 'role',
            attributes: { label: 'Heeft een relatie met' },
          },
          {
            type: 'membership',
            id: 'membership',
            relationships: {
              organization: {
                data: { type: 'organization', id: 'organization' },
              },
              member: { data: { type: 'organization', id: 'member' } },
              role: { data: { type: 'membership-role', id: 'role' } },
              during: {
                data: period ? { type: 'period-of-time', id: 'period' } : null,
              },
            },
          },
          ...(period
            ? [{ type: 'period-of-time', id: 'period', attributes: period }]
            : []),
        ],
      });
      return { organization, membership };
    }

    const event = { preventDefault() {} };

    /**
     * Stub the adapter so that no requests are sent, and return the log of
     * the requests that would have been sent, in order.
     */
    function stubAdapter(owner) {
      const adapter = owner.lookup('adapter:application');
      const requests = [];
      let nextId = 0;

      sinon
        .stub(adapter, 'createRecord')
        .callsFake(async (store, modelClass, snapshot) => {
          requests.push(`create ${snapshot.modelName}`);
          return {
            data: {
              type: snapshot.modelName,
              id: `new-${snapshot.modelName}-${++nextId}`,
            },
          };
        });
      sinon
        .stub(adapter, 'updateRecord')
        .callsFake(async (store, modelClass, snapshot) => {
          requests.push(`update ${snapshot.modelName}`);
          return null;
        });
      sinon
        .stub(adapter, 'deleteRecord')
        .callsFake(async (store, modelClass, snapshot) => {
          requests.push(`delete ${snapshot.modelName}`);
          return null;
        });

      return requests;
    }

    module('reset', function () {
      test('it restores a persisted membership that was removed but not saved', function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.reallyRemoveMembership(membership);

        assert.true(membership.isDeleted);
        assert.true(membership.hasDirtyAttributes);
        assert.false(membership.isNew);
        assert.true(controller.hasUnsavedEdits);

        controller.reset();

        assert.false(membership.isDeleted);
        assert.false(membership.hasDirtyAttributes);
        assert.false(membership.isDestroying);
        assert.strictEqual(
          store.peekRecord('membership', 'membership'),
          membership,
        );
        assert.strictEqual(controller.memberships, null);

        // Opening the edit page again shows the membership
        controller.setup();

        assert.deepEqual(controller.memberships, [membership]);
        assert.false(controller.hasUnsavedEdits);
      });

      test('it unloads a new membership that was added but not saved', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.addMembership();
        const newMembership = controller.memberships.at(-1);

        assert.true(newMembership.isNew);
        assert.strictEqual(store.peekAll('membership').length, 2);

        controller.reset();

        assert.true(newMembership.isDestroying);
        assert.strictEqual(store.peekAll('membership').length, 1);
        assert.false(membership.isDeleted);

        await settled();

        assert.true(newMembership.isDestroyed);
      });

      test('it leaves a membership alone whose deletion was saved', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.reallyRemoveMembership(membership);
        // A successful DELETE returns no payload
        const deleteStub = sinon.stub(
          this.owner.lookup('adapter:application'),
          'deleteRecord',
        );
        deleteStub.resolves(null);
        await store.request(saveRecord(membership));

        assert.true(membership.isDeleted);
        assert.false(membership.hasDirtyAttributes);
        assert.false(membership.isDestroying);
        assert.strictEqual(store.peekAll('membership').length, 0);

        controller.reset();

        assert.true(membership.isDeleted);
        assert.false(membership.hasDirtyAttributes);
        assert.strictEqual(store.peekAll('membership').length, 0);
        assert.strictEqual(controller.memberships, null);

        deleteStub.restore();
      });

      test('it leaves memberships alone whose save is still in flight', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.reallyRemoveMembership(membership);
        controller.addMembership();
        const newMembership = controller.memberships.at(-1);

        // The adapter only answers when the test says so, as a slow server
        // would
        const adapter = this.owner.lookup('adapter:application');
        let resolveDelete;
        let resolveCreate;
        const deleteStub = sinon.stub(adapter, 'deleteRecord').returns(
          new Promise((resolve) => {
            resolveDelete = resolve;
          }),
        );
        const createStub = sinon.stub(adapter, 'createRecord').returns(
          new Promise((resolve) => {
            resolveCreate = resolve;
          }),
        );
        const deleteRequest = store.request(saveRecord(membership));
        const createRequest = store.request(saveRecord(newMembership));

        assert.true(membership.isSaving);
        assert.true(newMembership.isSaving);

        // Leaving the edit page, e.g. with "Annuleer", while the save runs
        controller.reset();

        assert.true(newMembership.isNew);
        assert.false(newMembership.isDestroying);
        assert.true(store.peekAll('membership').includes(newMembership));
        assert.true(membership.isDeleted);
        assert.strictEqual(controller.memberships, null);

        resolveDelete(null);
        resolveCreate({ data: { type: 'memberships', id: 'new-membership' } });
        await Promise.all([deleteRequest, createRequest]);

        assert.false(newMembership.isNew);
        assert.false(newMembership.isSaving);
        assert.strictEqual(newMembership.id, 'new-membership');
        assert.true(membership.isDeleted);
        assert.false(membership.hasDirtyAttributes);
        assert.strictEqual(store.peekAll('membership').length, 1);

        deleteStub.restore();
        createStub.restore();
      });

      test('it ignores a membership that was already unloaded', function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        membership.deleteRecord();
        membership.unloadRecord();

        assert.true(membership.isDestroying);

        controller.reset();

        assert.strictEqual(store.peekRecord('membership', 'membership'), null);
        assert.strictEqual(controller.memberships, null);
      });

      test('it does not throw when there are no memberships', function (assert) {
        const { organization } = pushOrganizationWithMembership(this.store());
        const controller = this.controller();
        controller.model = { organization };
        controller.memberships = null;

        controller.reset();

        assert.strictEqual(controller.memberships, null);
        assert.strictEqual(controller.selectedRoleLabel, null);
      });

      test('it unloads a period that was added to a persisted membership but not saved', function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setStartDate(membership, new Date('2024-01-01'));
        const period = membership.belongsTo('during').value();

        assert.true(period.isNew);
        assert.deepEqual(membership.startDate, new Date('2024-01-01'));
        assert.true(controller.hasUnsavedEdits);

        controller.reset();

        assert.true(period.isDestroying);
        assert.strictEqual(membership.belongsTo('during').value(), null);
        assert.strictEqual(store.peekAll('period-of-time').length, 0);
        assert.false(membership.hasDirtyAttributes);
        assert.false(membership.isDestroying);

        // Opening the edit page again shows the membership without dates
        controller.setup();

        assert.deepEqual(controller.memberships, [membership]);
        assert.strictEqual(membership.startDate, undefined);
        assert.false(controller.hasUnsavedEdits);
      });

      test('it restores the dates of a persisted period that were changed but not saved', function (assert) {
        const store = this.store();
        const { organization, membership } = pushOrganizationWithMembership(
          store,
          { period: { endDate: new Date('2025-01-01') } },
        );
        const period = membership.belongsTo('during').value();
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setEndDate(membership, new Date('2026-01-01'));

        assert.true(period.hasDirtyAttributes);
        assert.deepEqual(membership.endDate, new Date('2026-01-01'));
        assert.true(controller.hasUnsavedEdits);

        controller.reset();

        assert.false(period.hasDirtyAttributes);
        assert.false(period.isDestroying);
        assert.deepEqual(membership.endDate, new Date('2025-01-01'));
        assert.strictEqual(store.peekAll('period-of-time').length, 1);

        // Opening the edit page again shows the original dates
        controller.setup();

        assert.deepEqual(controller.memberships, [membership]);
        assert.false(controller.hasUnsavedEdits);
      });

      test('it unloads the period of a new membership that was added but not saved', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.addMembership();
        const newMembership = controller.memberships.at(-1);
        controller.setEndDate(newMembership, new Date('2025-01-01'));

        assert.strictEqual(store.peekAll('period-of-time').length, 1);

        controller.reset();

        assert.strictEqual(store.peekAll('period-of-time').length, 0);
        assert.strictEqual(store.peekAll('membership').length, 1);

        await settled();

        assert.true(newMembership.isDestroyed);
      });

      test('it clears the validation errors of a persisted period whose dates were restored', async function (assert) {
        const store = this.store();
        const { organization, membership } = pushOrganizationWithMembership(
          store,
          { period: { endDate: new Date('2025-01-01') } },
        );
        const period = membership.belongsTo('during').value();
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        // A start date after the end date fails validation
        controller.setStartDate(membership, new Date('2026-01-01'));
        await controller.save.perform(event);

        assert.deepEqual(requests, []);
        assert.true(controller.hasValidationErrors);
        assert.notStrictEqual(period.error, undefined);
        assert.true(period.hasDirtyAttributes);

        controller.reset();

        assert.strictEqual(period.error, undefined);
        assert.false(period.hasDirtyAttributes);
        assert.deepEqual(membership.endDate, new Date('2025-01-01'));

        // Opening the edit page again shows no errors
        controller.setup();

        assert.false(controller.hasValidationErrors);
      });

      test('it clears the validation errors of a persisted period whose dates were reverted by hand', async function (assert) {
        const store = this.store();
        const { organization, membership } = pushOrganizationWithMembership(
          store,
          { period: { startDate: null, endDate: new Date('2025-01-01') } },
        );
        const period = membership.belongsTo('during').value();
        stubAdapter(this.owner);
        const controller = this.controller();
        sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setStartDate(membership, new Date('2026-01-01'));
        await controller.save.perform(event);
        controller.setStartDate(membership, null);

        assert.notStrictEqual(period.error, undefined);
        assert.false(period.hasDirtyAttributes);

        controller.reset();

        assert.strictEqual(period.error, undefined);
        assert.false(period.isDestroying);

        // Opening the edit page again shows no errors
        controller.setup();

        assert.false(controller.hasValidationErrors);
      });
    });

    module('setStartDate', function () {
      test('it does not create a period when an empty date is cleared', function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        // The date picker also reports an emptied input
        controller.setStartDate(membership, null);
        controller.setEndDate(membership, null);

        assert.strictEqual(membership.belongsTo('during').value(), null);
        assert.strictEqual(store.peekAll('period-of-time').length, 0);
        assert.false(controller.hasUnsavedEdits);
      });

      test('it creates the period of a membership on the first date', function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setEndDate(membership, new Date('2025-01-01'));

        const period = membership.belongsTo('during').value();
        assert.true(period.isNew);
        assert.strictEqual(
          period.endDate.getTime(),
          new Date('2025-01-01').getTime(),
        );
        assert.true(controller.hasUnsavedEdits);
      });
    });

    module('reallyRemoveMembership', function () {
      test('it unloads the period of a new membership that is removed', function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.addMembership();
        const newMembership = controller.memberships.at(-1);
        controller.setStartDate(newMembership, new Date('2024-01-01'));

        controller.reallyRemoveMembership(newMembership);

        assert.deepEqual(controller.memberships, [membership]);
        assert.strictEqual(store.peekAll('membership').length, 1);
        assert.strictEqual(store.peekAll('period-of-time').length, 0);
      });

      test('it keeps the period of a persisted membership that is removed until it is saved', function (assert) {
        const store = this.store();
        const { organization, membership } = pushOrganizationWithMembership(
          store,
          { period: { endDate: new Date('2025-01-01') } },
        );
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.reallyRemoveMembership(membership);

        assert.true(membership.isDeleted);
        assert.deepEqual(controller.memberships, [membership]);
        assert.strictEqual(store.peekAll('period-of-time').length, 1);
      });
    });

    module('save', function () {
      test('it saves a new period before linking it to a persisted membership', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        const transitionTo = sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setStartDate(membership, new Date('2024-01-01'));
        const period = membership.belongsTo('during').value();

        await controller.save.perform(event);

        assert.deepEqual(requests, [
          'create period-of-time',
          'update membership',
          'update organization',
        ]);
        assert.false(period.isNew);
        assert.false(period.hasDirtyAttributes);
        assert.strictEqual(membership.belongsTo('during').id(), period.id);
        assert.false(controller.hasValidationErrors);
        assert.true(
          transitionTo.calledOnceWithExactly(
            'organizations.organization.related-organizations',
            organization.id,
          ),
        );
      });

      test('it only saves the period when the dates of a persisted period change', async function (assert) {
        const store = this.store();
        const { organization, membership } = pushOrganizationWithMembership(
          store,
          { period: { endDate: new Date('2025-01-01') } },
        );
        const period = membership.belongsTo('during').value();
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setEndDate(membership, new Date('2026-01-01'));

        await controller.save.perform(event);

        assert.deepEqual(requests, [
          'update period-of-time',
          'update organization',
        ]);
        assert.false(period.hasDirtyAttributes);
        assert.deepEqual(membership.endDate, new Date('2026-01-01'));
      });

      test('it deletes a removed membership before its period', async function (assert) {
        const store = this.store();
        const { organization, membership } = pushOrganizationWithMembership(
          store,
          { period: { endDate: new Date('2025-01-01') } },
        );
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.reallyRemoveMembership(membership);

        await controller.save.perform(event);

        assert.deepEqual(requests, [
          'delete membership',
          'delete period-of-time',
          'update organization',
        ]);
        assert.strictEqual(store.peekAll('membership').length, 0);
        assert.strictEqual(store.peekAll('period-of-time').length, 0);
      });

      test('it does not persist a period without dates', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setStartDate(membership, new Date('2024-01-01'));
        controller.setStartDate(membership, null);
        const period = membership.belongsTo('during').value();

        assert.true(period.isEmpty);

        await controller.save.perform(event);

        assert.deepEqual(requests, ['update organization']);
        assert.strictEqual(membership.belongsTo('during').value(), null);
        assert.strictEqual(store.peekAll('period-of-time').length, 0);
      });

      test('it saves the period of a new membership before the membership', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.addMembership();
        const newMembership = controller.memberships.at(-1);
        newMembership.role = store.peekRecord('membership-role', 'role');
        newMembership.member = organization;
        newMembership.organization = store.peekRecord('organization', 'member');
        controller.setStartDate(newMembership, new Date('2024-01-01'));
        const period = newMembership.belongsTo('during').value();

        await controller.save.perform(event);

        assert.deepEqual(requests, [
          'create period-of-time',
          'create membership',
          'update organization',
        ]);
        assert.false(period.isNew);
        assert.false(newMembership.isNew);
        assert.strictEqual(newMembership.belongsTo('during').id(), period.id);
      });

      test('it does not save when the start date is after the end date', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        const transitionTo = sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setStartDate(membership, new Date('2025-01-01'));
        controller.setEndDate(membership, new Date('2024-01-01'));
        const period = membership.belongsTo('during').value();

        await controller.save.perform(event);

        assert.deepEqual(requests, []);
        assert.true(controller.hasValidationErrors);
        assert.propContains(period.error, {
          startDate: {
            message: 'Kies een startdatum die vóór de einddatum plaatsvindt',
          },
          endDate: {
            message: 'Kies een einddatum die na de startdatum plaatsvindt',
          },
        });
        assert.true(transitionTo.notCalled);
      });

      test('it keeps a new membership that only has dates so that it fails validation', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.addMembership();
        const newMembership = controller.memberships.at(-1);
        controller.setEndDate(newMembership, new Date('2025-01-01'));

        await controller.save.perform(event);

        assert.deepEqual(requests, []);
        assert.true(controller.hasValidationErrors);
        assert.deepEqual(controller.memberships, [membership, newMembership]);
        assert.propContains(newMembership.error, {
          role: { message: 'Selecteer een optie' },
        });
      });

      test('it does not validate the period of a removed membership', async function (assert) {
        const store = this.store();
        const { organization, membership } = pushOrganizationWithMembership(
          store,
          { period: { endDate: new Date('2025-01-01') } },
        );
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        const transitionTo = sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        // A start date after the end date, entered before removing the row
        controller.setStartDate(membership, new Date('2026-01-01'));
        controller.reallyRemoveMembership(membership);

        await controller.save.perform(event);

        assert.deepEqual(requests, [
          'delete membership',
          'delete period-of-time',
          'update organization',
        ]);
        assert.false(controller.hasValidationErrors);
        assert.true(transitionTo.calledOnce);
      });

      test('it discards the unsaved period of a removed membership', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        const transitionTo = sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        // Invalid dates, entered before removing the row
        controller.setStartDate(membership, new Date('2025-01-01'));
        controller.setEndDate(membership, new Date('2024-01-01'));
        controller.reallyRemoveMembership(membership);

        await controller.save.perform(event);

        assert.deepEqual(requests, [
          'delete membership',
          'update organization',
        ]);
        assert.false(controller.hasValidationErrors);
        assert.strictEqual(store.peekAll('period-of-time').length, 0);
        assert.true(transitionTo.calledOnce);
      });

      test('it ignores the errors of a membership that is removed after a failed save', async function (assert) {
        const store = this.store();
        const { organization, membership } = pushOrganizationWithMembership(
          store,
          { period: { endDate: new Date('2025-01-01') } },
        );
        const period = membership.belongsTo('during').value();
        const requests = stubAdapter(this.owner);
        const controller = this.controller();
        const transitionTo = sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setStartDate(membership, new Date('2026-01-01'));
        await controller.save.perform(event);

        assert.deepEqual(requests, []);
        assert.true(controller.hasValidationErrors);

        controller.reallyRemoveMembership(membership);

        // The row is hidden, so its errors no longer count
        assert.notStrictEqual(period.error, undefined);
        assert.false(controller.hasValidationErrors);

        await controller.save.perform(event);

        assert.deepEqual(requests, [
          'delete membership',
          'delete period-of-time',
          'update organization',
        ]);
        assert.true(transitionTo.calledOnce);
      });

      test('it saves the membership on a retry when linking its new period failed', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const requests = stubAdapter(this.owner);
        this.owner
          .lookup('adapter:application')
          .updateRecord.onFirstCall()
          .callsFake(async (_store, _modelClass, snapshot) => {
            requests.push(`update ${snapshot.modelName}`);
            throw new Error('PATCH failed');
          });
        const controller = this.controller();
        const transitionTo = sinon.stub(controller.router, 'transitionTo');
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.setEndDate(membership, new Date('2025-01-01'));
        const period = membership.belongsTo('during').value();

        await assert.rejects(controller.save.perform(event), /PATCH failed/);

        // The period is persisted, but the membership is not linked to it on
        // the server
        assert.deepEqual(requests, [
          'create period-of-time',
          'update membership',
        ]);
        assert.false(period.isNew);
        assert.false(period.hasDirtyAttributes);
        assert.strictEqual(membership.belongsTo('during').value(), period);
        assert.strictEqual(
          store.cache.getRemoteRelationship(
            recordIdentifierFor(membership),
            'during',
          ).data,
          null,
        );
        assert.true(transitionTo.notCalled);

        await controller.save.perform(event);

        assert.deepEqual(requests, [
          'create period-of-time',
          'update membership',
          'update membership',
          'update organization',
        ]);
        assert.strictEqual(membership.belongsTo('during').id(), period.id);
        assert.true(transitionTo.calledOnce);
      });
    });
  },
);
