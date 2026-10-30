import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

function municipalityLocation(id, label) {
  return { id, type: 'location', attributes: { label, level: 'Gemeente' } };
}

function municipality(id, name) {
  return { id, type: 'administrative-unit', attributes: { name } };
}

module(
  'Integration | Component | municipality-select-by-name',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      this.set('onChange', () => {});
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    async function optionLabels() {
      await render(hbs`
        <MunicipalitySelectByName
          @selectedProvince={{this.province}}
          @onChange={{this.onChange}}
        />
      `);
      await clickTrigger();
      return findAll('.ember-power-select-option').map((option) =>
        option.textContent.trim(),
      );
    }

    test('it lists the municipality locations within the selected province', async function (assert) {
      const store = this.owner.lookup('service:store');
      const request = sinon.stub(store, 'request').resolves({
        content: store.push({
          data: [
            municipalityLocation('gemeente-a', 'Gemeente A'),
            municipalityLocation('gemeente-b', 'Gemeente B'),
          ],
        }),
      });
      this.set('province', 'Provincie A');

      assert.deepEqual(await optionLabels(), ['Gemeente A', 'Gemeente B']);
      assert.strictEqual(request.callCount, 1);
      const [{ data }] = request.firstCall.args;
      assert.strictEqual(data.type, 'location');
      assert.deepEqual(data.query, {
        filter: {
          ':exact:level': 'Gemeente',
          'located-within': { ':exact:label': 'Provincie A' },
        },
        sort: 'label',
        page: { size: 400 },
      });
    });

    test('it lists all municipalities without a selected province', async function (assert) {
      const store = this.owner.lookup('service:store');
      const request = sinon.stub(store, 'request').resolves({
        content: store.push({
          data: [
            municipality('gemeente-a', 'Gemeente A'),
            municipality('gemeente-b', 'Gemeente B'),
          ],
        }),
      });

      assert.deepEqual(await optionLabels(), ['Gemeente A', 'Gemeente B']);
      assert.strictEqual(request.callCount, 1);
      const [{ data }] = request.firstCall.args;
      assert.strictEqual(data.type, 'organization');
      assert.deepEqual(data.query, {
        filter: { classification: { id: CLASSIFICATION.MUNICIPALITY.id } },
        sort: 'name',
        page: { size: 400 },
      });
    });
  },
);
