import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';

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
        resultingOrganizations: [resultingOrganisation],
        originalOrganizations: [originalOrganisation],
      });

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
        originalOrganizations: [
          originalOrganisationOne,
          originalOrganisationTwo,
        ],
      });

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
        resultingOrganizations: [resultingOrganisation],
        originalOrganizations: [originalOrganisation],
      });

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
        originalOrganizations: [
          originalOrganisationOne,
          originalOrganisationTwo,
        ],
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        resultingOrganizations: {
          message: 'Selecteer een resulterende organisatie',
        },
      });
    });

    [
      [CHANGE_EVENT_TYPE.NAME_CHANGE, 'name change'],
      [CHANGE_EVENT_TYPE.IN_ONTBINDING, 'dissolution'],
      [CHANGE_EVENT_TYPE.IN_VEREFFENING, 'liquidation'],
      [CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND, 'dissolution and liquidated'],
      [CHANGE_EVENT_TYPE.OPRICHTING, 'establishment'],
      [CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE, 'area description change'],
      [CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED, 'recognition not granted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_LIFTED, 'recognition lifted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED, 'recognition requested'],
      [CHANGE_EVENT_TYPE.RECOGNITION_GRANTED, 'recognition granted'],
      [
        CHANGE_EVENT_TYPE.SUSPENSION_OF_RECOGNITION,
        'suspension of recognition',
      ],
      [CHANGE_EVENT_TYPE.SANCTIONED, 'sanctioned'],
      [CHANGE_EVENT_TYPE.CITY, 'city'],
      [CHANGE_EVENT_TYPE.GEOGRAPHICAL_AREA_CHANGE, 'geographical area change'],
    ].forEach(([id, name]) => {
      test(`it returns no errors when original/resulting organisations are missing for a ${name} event`, async function (assert) {
        const eventType = this.store().createRecord('change-event-type', {
          id,
        });
        const model = this.store().createRecord('change-event', {
          date: new Date('01-01-2024'),
          type: eventType,
        });

        const isValid = await model.validate();

        assert.true(isValid);
      });
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

    test('it returns falsy for a model with an incorrect type', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: 'This is an invalid change event type',
      });

      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

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

    [
      [CHANGE_EVENT_TYPE.NAME_CHANGE, 'name change'],
      [CHANGE_EVENT_TYPE.IN_ONTBINDING, 'dissolution'],
      [CHANGE_EVENT_TYPE.IN_VEREFFENING, 'liquidation'],
      [CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND, 'dissolution and liquidated'],
      [CHANGE_EVENT_TYPE.OPRICHTING, 'establishment'],
      [CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE, 'area description change'],
      [CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED, 'recognition not granted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_LIFTED, 'recognition lifted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED, 'recognition requested'],
      [CHANGE_EVENT_TYPE.RECOGNITION_GRANTED, 'recognition granted'],
      [
        CHANGE_EVENT_TYPE.SUSPENSION_OF_RECOGNITION,
        'suspension of recognition',
      ],
      [CHANGE_EVENT_TYPE.SANCTIONED, 'sanctioned'],
      [CHANGE_EVENT_TYPE.CITY, 'city'],
      [CHANGE_EVENT_TYPE.GEOGRAPHICAL_AREA_CHANGE, 'geographical area change'],
    ].forEach(([id, name]) => {
      test(`it returns falsy for a ${name} event`, async function (assert) {
        const eventType = this.store().createRecord('change-event-type', {
          id,
        });
        const model = this.store().createRecord('change-event', {
          type: eventType,
        });

        assert.notOk(model.isMergerChangeEvent);
      });
    });
  });

  module('canAffectMultipleOrganizations', function () {
    test('it returns falsy for a model without type', function (assert) {
      const model = this.store().createRecord('change-event');

      assert.notOk(model.canAffectMultipleOrganizations);
    });

    test('it returns falsy for a model with an incorrect type', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: 'This is an invalid change event type',
      });

      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

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

    [
      [CHANGE_EVENT_TYPE.NAME_CHANGE, 'name change'],
      [CHANGE_EVENT_TYPE.IN_ONTBINDING, 'dissolution'],
      [CHANGE_EVENT_TYPE.IN_VEREFFENING, 'liquidation'],
      [CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND, 'dissolution and liquidated'],
      [CHANGE_EVENT_TYPE.OPRICHTING, 'establishment'],
      [CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED, 'recognition not granted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_LIFTED, 'recognition lifted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED, 'recognition requested'],
      [CHANGE_EVENT_TYPE.RECOGNITION_GRANTED, 'recognition granted'],
      [
        CHANGE_EVENT_TYPE.SUSPENSION_OF_RECOGNITION,
        'suspension of recognition',
      ],
      [CHANGE_EVENT_TYPE.SANCTIONED, 'sanctioned'],
      [CHANGE_EVENT_TYPE.CITY, 'city'],
      [CHANGE_EVENT_TYPE.GEOGRAPHICAL_AREA_CHANGE, 'geographical area change'],
    ].forEach(([id, name]) => {
      test(`it returns falsy for a ${name} event`, async function (assert) {
        const eventType = this.store().createRecord('change-event-type', {
          id,
        });
        const model = this.store().createRecord('change-event', {
          type: eventType,
        });

        assert.notOk(model.canAffectMultipleOrganizations);
      });
    });
  });

  module('isCityChangeEvent', function () {
    test('it returns falsy for a model without type', function (assert) {
      const model = this.store().createRecord('change-event');

      assert.notOk(model.isCityChangeEvent);
    });

    test('it returns falsy for a model with an incorrect type', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: 'This is an invalid change event type',
      });

      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

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

    [
      [CHANGE_EVENT_TYPE.NAME_CHANGE, 'name change'],
      [CHANGE_EVENT_TYPE.IN_ONTBINDING, 'dissolution'],
      [CHANGE_EVENT_TYPE.IN_VEREFFENING, 'liquidation'],
      [CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND, 'dissolution and liquidated'],
      [CHANGE_EVENT_TYPE.OPRICHTING, 'establishment'],
      [CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE, 'area description change'],
      [CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED, 'recognition not granted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_LIFTED, 'recognition lifted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED, 'recognition requested'],
      [CHANGE_EVENT_TYPE.RECOGNITION_GRANTED, 'recognition granted'],
      [CHANGE_EVENT_TYPE.MERGER, 'merger'],
      [CHANGE_EVENT_TYPE.FUSIE, 'fusion'],
      [
        CHANGE_EVENT_TYPE.SUSPENSION_OF_RECOGNITION,
        'suspension of recognition',
      ],
      [CHANGE_EVENT_TYPE.SANCTIONED, 'sanctioned'],
      [CHANGE_EVENT_TYPE.GEOGRAPHICAL_AREA_CHANGE, 'geographical area change'],
    ].forEach(([id, name]) => {
      test(`it returns falsy for a ${name} event`, async function (assert) {
        const eventType = this.store().createRecord('change-event-type', {
          id,
        });
        const model = this.store().createRecord('change-event', {
          type: eventType,
        });

        assert.notOk(model.isCityChangeEvent);
      });
    });
  });

  module('requiresDecisionInformation', function () {
    test('it returns falsy for a model without type', function (assert) {
      const model = this.store().createRecord('change-event');

      assert.notOk(model.requiresDecisionInformation);
    });

    test('it returns falsy for a model with an incorrect type', function (assert) {
      const eventType = this.store().createRecord('change-event-type', {
        id: 'This is an invalid change event type',
      });

      const model = this.store().createRecord('change-event', {
        type: eventType,
      });

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

    [
      [CHANGE_EVENT_TYPE.NAME_CHANGE, 'name change'],
      [CHANGE_EVENT_TYPE.IN_ONTBINDING, 'dissolution'],
      [CHANGE_EVENT_TYPE.IN_VEREFFENING, 'liquidation'],
      [CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND, 'dissolution and liquidated'],
      [CHANGE_EVENT_TYPE.OPRICHTING, 'establishment'],
      [CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE, 'area description change'],
      [CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED, 'recognition not granted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_LIFTED, 'recognition lifted'],
      [CHANGE_EVENT_TYPE.RECOGNITION_GRANTED, 'recognition granted'],
      [CHANGE_EVENT_TYPE.MERGER, 'merger'],
      [CHANGE_EVENT_TYPE.FUSIE, 'fusion'],
      [
        CHANGE_EVENT_TYPE.SUSPENSION_OF_RECOGNITION,
        'suspension of recognition',
      ],
      [CHANGE_EVENT_TYPE.SANCTIONED, 'sanctioned'],
      [CHANGE_EVENT_TYPE.CITY, 'city'],
      [CHANGE_EVENT_TYPE.GEOGRAPHICAL_AREA_CHANGE, 'geographical area change'],
    ].forEach(([id, name]) => {
      test(`it returns truthy for a ${name} event`, async function (assert) {
        const eventType = this.store().createRecord('change-event-type', {
          id,
        });
        const model = this.store().createRecord('change-event', {
          type: eventType,
        });

        assert.ok(model.requiresDecisionInformation);
      });
    });
  });
});
