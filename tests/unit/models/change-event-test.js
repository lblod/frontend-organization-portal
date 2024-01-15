import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';

module('Unit | Model | change event', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

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
    assert.propContains(model.error, { date: { message: 'Vul de datum in' } });
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

    console.log(eventType.id);
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
    console.log(model.error);
    assert.strictEqual(Object.keys(model.error).length, 2);
    assert.propContains(model.error, {
      resultingOrganizations: {
        message: 'Selecteer een resulterende organisatie',
      },
      originalOrganizations: { message: 'Selecteer een betrokken organisatie' },
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
      originalOrganizations: { message: 'Selecteer een betrokken organisatie' },
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
      originalOrganizations: { message: 'Selecteer een betrokken organisatie' },
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
      originalOrganizations: { message: 'Selecteer een betrokken organisatie' },
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
