import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { findAll, render } from '@ember/test-helpers';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { selectedMultipleOptionLabels } from 'frontend-organization-portal/tests/helpers/power-select';
import LegalFormMultipleSelect from 'frontend-organization-portal/components/legal-form-multiple-select';

const VZW = 'dbdd09f3-55b1-48bc-ac51-2c87f951860a';
const BV = '8aa6149a-0916-42ed-a907-f760c0720527';

function legalForm(id, label) {
  return { id, type: 'concept', attributes: { label } };
}

const noopOnChange = () => {};

module(
  'Integration | Component | legal-form-multiple-select',
  function (hooks) {
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

    test('it lists the legal forms of the "Juridische vorm" concept scheme', async function (assert) {
      await render(
        <template>
          <LegalFormMultipleSelect @onChange={{noopOnChange}} />
        </template>,
      );

      await clickTrigger();

      assert.deepEqual(
        findAll('.ember-power-select-option').map((option) =>
          option.textContent.trim(),
        ),
        ['Vereniging zonder winstoogmerk', 'Besloten Vennootschap'],
      );
    });

    test('it preselects the legal forms matching the selected ids', async function (assert) {
      this.selected = `${VZW},${BV}`;

      await render(
        <template>
          <LegalFormMultipleSelect
            @selected={{this.selected}}
            @onChange={{noopOnChange}}
          />
        </template>,
      );

      const selected = selectedMultipleOptionLabels();

      assert.strictEqual(selected.length, 2);
      assert.ok(selected.includes('Vereniging zonder winstoogmerk'));
      assert.ok(selected.includes('Besloten Vennootschap'));
    });
  },
);
