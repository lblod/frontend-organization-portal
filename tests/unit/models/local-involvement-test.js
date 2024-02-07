import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { INVOLVEMENT_TYPE } from 'frontend-organization-portal/models/involvement-type';

module('Unit | Model | local involvement', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    test('it returns error when required fields are missing', async function (assert) {
      const model = this.store().createRecord('local-involvement');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 2);
      assert.propContains(model.error, {
        administrativeUnit: { message: 'Selecteer een lokaal bestuur' },
        involvementType: { message: 'Selecteer een type betrokkenheid' },
      });
    });

    test('it forbids ADVISORY as involvementType when administrativeUnit is a province', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        {
          ...CLASSIFICATION.PROVINCE,
        }
      );
      const administrativeUnit = this.store().createRecord(
        'administrative-unit',
        {
          classification,
        }
      );
      const involvementType = this.store().createRecord('involvement-type', {
        id: INVOLVEMENT_TYPE.ADVISORY,
      });
      const model = this.store().createRecord('local-involvement', {
        administrativeUnit,
        involvementType,
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 1);
      assert.propContains(model.error, {
        involvementType: {
          message: 'Adviserend is geen geldige keuze voor een provincie',
        },
      });
    });

    [
      ['0', 'Het percentage moet groter zijn dan 0'],
      ['101', 'Het percentage mag niet groter zijn dan 100'],
      ['not a number', 'Vul het percentage in'],
      ['', 'Vul het percentage in'],
      [undefined, 'Vul het percentage in'],
    ].forEach(([percentage, errorMessage]) => {
      test(`it returns error when involvementType is SUPERVISORY and percent is ${percentage}`, async function (assert) {
        const administrativeUnit = this.store().createRecord(
          'administrative-unit'
        );
        const involvementType = this.store().createRecord('involvement-type', {
          id: INVOLVEMENT_TYPE.SUPERVISORY,
        });
        const model = this.store().createRecord('local-involvement', {
          administrativeUnit,
          involvementType,
          percentage,
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 1);
        assert.propContains(model.error, {
          percentage: {
            message: errorMessage,
          },
        });
      });
    });
  });
});
