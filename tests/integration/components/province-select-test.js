import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

function provinceLocation(id, label) {
  return { id, type: 'location', attributes: { label, level: 'Provincie' } };
}

function province(id, name) {
  return { id, type: 'administrative-unit', attributes: { name } };
}

module('Integration | Component | province-select', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('onChange', sinon.spy());
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  async function optionLabels() {
    await render(hbs`
      <ProvinceSelect
        @selectedMunicipality={{this.municipality}}
        @onChange={{this.onChange}}
      />
    `);
    await clickTrigger();
    return findAll('.ember-power-select-option').map((option) =>
      option.textContent.trim(),
    );
  }

  test('it selects the province location the selected municipality lies in', async function (assert) {
    const store = this.owner.lookup('service:store');
    const request = sinon.stub(store, 'request').resolves({
      content: store.push({
        data: [provinceLocation('provincie-a', 'Provincie A')],
      }),
    });
    this.set('municipality', 'Gemeente A');

    assert.deepEqual(await optionLabels(), ['Provincie A']);
    assert.deepEqual(this.onChange.args, [['Provincie A']]);
    assert.strictEqual(request.callCount, 1);
    const [{ data }] = request.firstCall.args;
    assert.strictEqual(data.type, 'location');
    assert.deepEqual(data.query, {
      filter: {
        ':exact:level': 'Provincie',
        locations: { ':exact:label': 'Gemeente A' },
      },
    });
  });

  test('it lists all provinces without a selected municipality', async function (assert) {
    const store = this.owner.lookup('service:store');
    const request = sinon.stub(store, 'request').resolves({
      content: store.push({
        data: [
          province('provincie-a', 'Provincie A'),
          province('provincie-b', 'Provincie B'),
        ],
      }),
    });

    assert.deepEqual(await optionLabels(), ['Provincie A', 'Provincie B']);
    assert.true(this.onChange.notCalled);
    assert.strictEqual(request.callCount, 1);
    const [{ data }] = request.firstCall.args;
    assert.strictEqual(data.type, 'organization');
    assert.deepEqual(data.query, {
      filter: { classification: { id: CLASSIFICATION.PROVINCE.id } },
      sort: 'name',
    });
  });
});
