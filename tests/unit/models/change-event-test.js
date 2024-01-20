import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  CHANGE_EVENT_TYPE,
  MergerTypeIdList,
  MultipleOrganizationTypeIdList,
  RequiresDecisionTypeIdList,
} from 'frontend-organization-portal/models/change-event-type';

module('Unit | Model | change event', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validation', function () {
    test('it returns errors when the model is empty', async function (assert) {
      const model = this.store().createRecord('change-event');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        type: { message: 'Selecteer een type' },
        date: { message: 'Vul de datum in' },
      });
    });

    test('it returns an error when the date is missing', async function (assert) {
      const eventType = this.store().createRecord('change-event-type');
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        date: { message: 'Vul de datum in' },
      });
    });

    test('it returns an error when the change event type is missing', async function (assert) {
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        type: { message: 'Selecteer een type' },
      });
    });

    test('it returns no errors when the optional description is missing', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.NAME_CHANGE,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when an empty description is given', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.NAME_CHANGE,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
        description: '',
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns errors when mandatory organisations are missing for a fusion event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.FUSIE,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        resultingOrganizations: {
          message: 'Selecteer een resulterende organisatie',
        },
        originalOrganizations: {
          message: 'Selecteer een betrokken organisatie',
        },
      });
    });

    test('it returns an error when only one original organisation is given for a fusion event', async function (assert) {
      const originalOrganisation = this.store().createRecord(
        'administrative-unit'
      );
      const resultingOrganisation = this.store().createRecord(
        'administrative-unit'
      );

      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.FUSIE,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });
      model.resultingOrganizations.pushObject(resultingOrganisation);
      model.originalOrganizations.pushObject(originalOrganisation);

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        originalOrganizations: {
          message: 'Selecteer een betrokken organisatie',
        },
      });
    });

    test('it returns an error when mandatory resulting organisation is missing for a fusion event', async function (assert) {
      const originalOrganisationOne = this.store().createRecord(
        'administrative-unit'
      );
      const originalOrganisationTwo = this.store().createRecord(
        'administrative-unit'
      );

      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.FUSIE,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });
      model.originalOrganizations.pushObject(originalOrganisationOne);
      model.originalOrganizations.pushObject(originalOrganisationTwo);

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        resultingOrganizations: {
          message: 'Selecteer een resulterende organisatie',
        },
      });
    });

    test('it returns errors when mandatory organisations are missing for a merger event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.MERGER,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        resultingOrganizations: {
          message: 'Selecteer een resulterende organisatie',
        },
        originalOrganizations: {
          message: 'Selecteer een betrokken organisatie',
        },
      });
    });

    test('it returns an error when only one original organisation is given for a merge event', async function (assert) {
      const originalOrganisation = this.store().createRecord(
        'administrative-unit'
      );
      const resultingOrganisation = this.store().createRecord(
        'administrative-unit'
      );

      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.MERGER,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });
      model.resultingOrganizations.pushObject(resultingOrganisation);
      model.originalOrganizations.pushObject(originalOrganisation);

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        originalOrganizations: {
          message: 'Selecteer een betrokken organisatie',
        },
      });
    });

    test('it returns an error when mandatory resulting organisation is missing for a merger event', async function (assert) {
      const originalOrganisationOne = this.store().createRecord(
        'administrative-unit'
      );
      const originalOrganisationTwo = this.store().createRecord(
        'administrative-unit'
      );

      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.MERGER,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });
      model.originalOrganizations.pushObject(originalOrganisationOne);
      model.originalOrganizations.pushObject(originalOrganisationTwo);

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        resultingOrganizations: {
          message: 'Selecteer een resulterende organisatie',
        },
      });
    });

    test('it returns no errors when original/resulting organisations are missing for a name change event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.NAME_CHANGE,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a dissolution event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.IN_ONTBINDING,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a liquidation event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.IN_VEREFFENING,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a dissolution and liquidated event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for an establishment event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.OPRICHTING,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for an area description change event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a recognition not granted event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a recognition lifted event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.RECOGNITION_LIFTED,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a recognition requested event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a recognition granted event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.RECOGNITION_GRANTED,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a suspension of recognition event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.SUSPENCION_OF_RECOGNITION,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a sanction event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.SANCTIONED,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a city event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.CITY,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });

    test('it returns no errors when original/resulting organisations are missing for a geographical area change event', async function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.GEOGRAPHICAL_AREA_CHANGE,
      });
      const model = this.store().createRecord('change-event', {
        date: new Date('01-01-2024'),
        type: eventType,
      });

      const isValid = await model.validate();

      assert.true(isValid);
    });
  });

  module('originalOrganizations', function (hooks) {
    hooks.beforeEach(function () {
      this.model = this.store().createRecord('change-event');
      this.organization = this.store().createRecord('administrative-unit');
      this.otherOrganization = this.store().createRecord('administrative-unit');
    });

    hooks.afterEach(function () {
      this.model = null;
      this.organization = null;
      this.otherOrganization = null;
    });

    module('addOriginalOrganization', function () {
      test('it correctly adds multiple different original organizations', function (assert) {
        this.model.addOriginalOrganization(this.organization);
        assert.strictEqual(this.model.originalOrganizations.length, 1);
        assert.true(
          this.model.originalOrganizations.includes(this.organization)
        );

        this.model.addOriginalOrganization(this.otherOrganization);
        assert.strictEqual(this.model.originalOrganizations.length, 2);
        assert.true(
          this.model.originalOrganizations.includes(this.otherOrganization)
        );
      });

      test('it does not add duplicate original organizations', function (assert) {
        this.model.addOriginalOrganization(this.organization);
        assert.strictEqual(this.model.originalOrganizations.length, 1);
        assert.true(
          this.model.originalOrganizations.includes(this.organization)
        );

        this.model.addOriginalOrganization(this.organization);
        assert.strictEqual(this.model.originalOrganizations.length, 1);
        assert.true(
          this.model.originalOrganizations.includes(this.organization)
        );
      });

      test('it has no effect to add undefined', function (assert) {
        this.model.addOriginalOrganization(undefined);
        assert.strictEqual(this.model.originalOrganizations.length, 0);
      });
    });

    module('removeOriginalOrganization', function () {
      test('it removes an existing organization', function (assert) {
        this.model.addOriginalOrganization(this.organization);
        this.model.addOriginalOrganization(this.otherOrganization);
        assert.strictEqual(this.model.originalOrganizations.length, 2);

        this.model.removeOriginalOrganization(this.organization);
        assert.strictEqual(this.model.originalOrganizations.length, 1);
        assert.false(
          this.model.originalOrganizations.includes(this.organization)
        );
        assert.true(
          this.model.originalOrganizations.includes(this.otherOrganization)
        );
      });

      test('it has no impact to remove an non-existing organisation', function (assert) {
        this.model.addOriginalOrganization(this.organization);
        this.model.addOriginalOrganization(this.otherOrganization);

        const removedOrganisation = this.store().createRecord(
          'administrative-unit'
        );

        assert.strictEqual(this.model.originalOrganizations.length, 2);
        assert.false(
          this.model.originalOrganizations.includes(removedOrganisation)
        );

        this.model.removeOriginalOrganization(removedOrganisation);
        assert.strictEqual(this.model.originalOrganizations.length, 2);
        assert.true(
          this.model.originalOrganizations.includes(this.organization)
        );
        assert.true(
          this.model.originalOrganizations.includes(this.otherOrganization)
        );
      });

      test('it has no effect to remove undefined', function (assert) {
        this.model.addOriginalOrganization(this.organization);
        this.model.addOriginalOrganization(this.otherOrganization);
        assert.strictEqual(this.model.originalOrganizations.length, 2);

        this.model.removeOriginalOrganization(undefined);
        assert.strictEqual(this.model.originalOrganizations.length, 2);
      });
    });
  });

  module('resultingOrganizations', function (hooks) {
    hooks.beforeEach(function () {
      this.model = this.store().createRecord('change-event');
      this.organization = this.store().createRecord('administrative-unit');
      this.otherOrganization = this.store().createRecord('administrative-unit');
    });

    hooks.afterEach(function () {
      this.model = null;
      this.organization = null;
      this.otherOrganization = null;
    });

    module('addResultingOrganization', function () {
      test('it adds the provided organization', function (assert) {
        assert.strictEqual(this.model.resultingOrganizations.length, 0);

        this.model.addResultingOrganization(this.organization);

        assert.strictEqual(this.model.resultingOrganizations.length, 1);
        assert.true(
          this.model.resultingOrganizations.includes(this.organization)
        );
      });

      test('it does not add duplicate resulting organizations', function (assert) {
        this.model.addResultingOrganization(this.organization);
        assert.strictEqual(this.model.resultingOrganizations.length, 1);
        assert.true(
          this.model.resultingOrganizations.includes(this.organization)
        );

        this.model.addResultingOrganization(this.organization);
        assert.strictEqual(this.model.resultingOrganizations.length, 1);
        assert.true(
          this.model.resultingOrganizations.includes(this.organization)
        );
      });

      test('it first clears existing resulting organizations before adding a new one', function (assert) {
        this.model.addResultingOrganization(this.organization);
        assert.strictEqual(this.model.resultingOrganizations.length, 1);
        assert.true(
          this.model.resultingOrganizations.includes(this.organization)
        );

        this.model.addResultingOrganization(this.otherOrganization);
        assert.strictEqual(this.model.resultingOrganizations.length, 1);
        assert.true(
          this.model.resultingOrganizations.includes(this.otherOrganization)
        );
        assert.false(
          this.model.resultingOrganizations.includes(this.organization)
        );
      });

      test('it has no effect to add undefined', function (assert) {
        this.model.addResultingOrganization(undefined);
        assert.strictEqual(this.model.resultingOrganizations.length, 0);
      });
    });

    module('removeResultingOrganization', function () {
      test('it removes an existing organization', function (assert) {
        this.model.addResultingOrganization(this.organization);
        assert.strictEqual(this.model.resultingOrganizations.length, 1);

        this.model.removeResultingOrganization(this.organization);
        assert.strictEqual(this.model.resultingOrganizations.length, 0);
        assert.false(
          this.model.resultingOrganizations.includes(this.organization)
        );
      });

      test('it has no impact to remove an non-existing organisation', function (assert) {
        this.model.addResultingOrganization(this.organization);

        const removedOrganisation = this.store().createRecord(
          'administrative-unit'
        );

        assert.strictEqual(this.model.resultingOrganizations.length, 1);
        assert.false(
          this.model.resultingOrganizations.includes(removedOrganisation)
        );

        this.model.removeResultingOrganization(removedOrganisation);
        assert.strictEqual(this.model.resultingOrganizations.length, 1);
        assert.true(
          this.model.resultingOrganizations.includes(this.organization)
        );
      });

      test('it has no effect to remove undefined', function (assert) {
        this.model.addResultingOrganization(this.organization);
        assert.strictEqual(this.model.resultingOrganizations.length, 1);

        this.model.removeResultingOrganization(undefined);
        assert.strictEqual(this.model.resultingOrganizations.length, 1);
      });
    });
  });

  module('isMergerChangeEvent', function () {
    test('it returns falsy for a model without type', function (assert) {
      const model = this.store().createRecord('change-event');

      assert.notOk(model.isMergerChangeEvent);
    });

    test('it returns truthy for a MERGER', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.MERGER,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.ok(model.isMergerChangeEvent);
    });

    test('it returns truthy for a FUSIE', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.FUSIE,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.ok(model.isMergerChangeEvent);
    });

    test('it returns falsy for other event types', function (assert) {
      assert.expect(
        Object.keys(CHANGE_EVENT_TYPE).length - MergerTypeIdList.length
      );
      for (const typeId of Object.values(CHANGE_EVENT_TYPE).filter(
        (id) => !MergerTypeIdList.includes(id)
      )) {
        const eventType = this.store().createRecord('change-event-type', {
          id: typeId,
        });
        const model = this.store().createRecord('change-event', {
          type: eventType,
        });

        assert.notOk(model.isMergerChangeEvent);
      }
    });
  });

  module('canAffectMultipleOrganizations', function () {
    test('it returns falsy for a model without type', function (assert) {
      const model = this.store().createRecord('change-event');

      assert.notOk(model.canAffectMultipleOrganizations);
    });

    test('it returns truthy for a MERGER', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.MERGER,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.ok(model.canAffectMultipleOrganizations);
    });

    test('it returns truthy for a FUSIE', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.FUSIE,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.ok(model.canAffectMultipleOrganizations);
    });

    test('it returns truthy for an area description change', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.ok(model.canAffectMultipleOrganizations);
    });

    test('it returns falsy for other event types', function (assert) {
      assert.expect(
        Object.keys(CHANGE_EVENT_TYPE).length -
          MultipleOrganizationTypeIdList.length
      );
      for (let typeId of Object.values(CHANGE_EVENT_TYPE).filter(
        (id) => !MultipleOrganizationTypeIdList.includes(id)
      )) {
        const eventType = this.store().createRecord('change-event-type', {
          id: typeId,
        });
        const model = this.store().createRecord('change-event', {
          type: eventType,
        });

        assert.notOk(model.canAffectMultipleOrganizations);
      }
    });
  });

  module('isCityChangeEvent', function () {
    test('it returns falsy for a model without type', function (assert) {
      const model = this.store().createRecord('change-event');

      assert.notOk(model.isCityChangeEvent);
    });

    test('it returns truthy for a city event', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.CITY,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.ok(model.isCityChangeEvent);
    });

    test('it returns falsy for a fusie event', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.FUSIE,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.notOk(model.isCityChangeEvent);
    });

    test('it returns falsy for a merger event', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.MERGER,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.notOk(model.isCityChangeEvent);
    });

    test('it returns falsy for other event types', function (assert) {
      assert.expect(Object.keys(CHANGE_EVENT_TYPE).length - 1);
      for (const typeId of Object.values(CHANGE_EVENT_TYPE).filter(
        (id) => id !== CHANGE_EVENT_TYPE.CITY
      )) {
        const eventType = this.store().createRecord('change-event-type', {
          id: typeId,
        });
        const model = this.store().createRecord('change-event', {
          type: eventType,
        });

        assert.notOk(model.isCityChangeEvent);
      }
    });
  });

  module('requiresDecisionInformation', function () {
    test('it returns falsy for a model without type', function (assert) {
      const model = this.store().createRecord('change-event');

      assert.notOk(model.requiresDecisionInformation);
    });

    test('it returns falsy for a recognition requested event', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.notOk(model.requiresDecisionInformation);
    });

    test('it returns truthy for a fusie event', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.FUSIE,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.ok(model.requiresDecisionInformation);
    });

    test('it returns truthy for a merger event', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: CHANGE_EVENT_TYPE.MERGER,
      });
      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

      assert.ok(model.requiresDecisionInformation);
    });

    test('it returns truthy for other event types', function (assert) {
      assert.expect(RequiresDecisionTypeIdList.length);
      for (const typeId of Object.values(CHANGE_EVENT_TYPE).filter((id) =>
        RequiresDecisionTypeIdList.includes(id)
      )) {
        const eventType = this.store().createRecord('change-event-type', {
          id: typeId,
        });
        const model = this.store().createRecord('change-event', {
          type: eventType,
        });

        assert.ok(model.requiresDecisionInformation);
      }
    });
  });
});
