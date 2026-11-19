import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { findAll, render } from '@ember/test-helpers';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import LegalFormSelect from 'frontend-organization-portal/components/legal-form-select';

const VZW = 'dbdd09f3-55b1-48bc-ac51-2c87f951860a';
const BV = '8aa6149a-0916-42ed-a907-f760c0720527';

function legalForm(id, label) {
  return { id, type: 'concept', attributes: { label } };
}

const noopOnChange = () => {};

module('Integration | Component | legal-form-select', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const concepts = store.push({
      data: [
        legalForm(VZW, 'Vereniging zonder winstoogmerk'),
        legalForm(BV, 'Besloten Vennootschap'),
      ],
    });
    sinon.stub(store, 'request').resolves({ content: concepts });
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  async function optionLabels() {
    await render(
      <template><LegalFormSelect @onChange={{noopOnChange}} /></template>,
    );
    await clickTrigger();
    return findAll('.ember-power-select-option').map((option) =>
      option.textContent.trim(),
    );
  }

  test('it lists the legal forms of the "Juridische vorm" concept scheme', async function (assert) {
    assert.deepEqual(await optionLabels(), [
      'Vereniging zonder winstoogmerk',
      'Besloten Vennootschap',
    ]);
  });

  test('it preselects the legal form matching the selected id', async function (assert) {
    await render(
      <template>
        <LegalFormSelect @selected={{BV}} @onChange={{noopOnChange}} />
      </template>,
    );

    assert
      .dom('.ember-power-select-selected-item')
      .hasText('Besloten Vennootschap');
  });
});
