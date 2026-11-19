import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { findAll, render } from '@ember/test-helpers';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { selectedMultipleOptionLabels } from 'frontend-organization-portal/tests/helpers/power-select';
import AdditionalQualificationsMultipleSelect from 'frontend-organization-portal/components/additional-qualifications-multiple-select';
import { ADDITIONAL_QUALIFICATIONS } from 'frontend-organization-portal/models/additional-qualification-code';

const AFVALINTERCOMMUNALE = 'fb7c4b8d-6927-45ba-8f4e-f4854d437815';
const DISTRIBUTIENETBEHEERDER = '87966ef7-cc35-48c3-94b6-ffb41f65bed3';
const NONE = ADDITIONAL_QUALIFICATIONS.NONE;

function qualification(id, label) {
  return { id, type: 'additional-qualification-code', attributes: { label } };
}

const noopOnChange = () => {};

module(
  'Integration | Component | additional-qualifications-multiple-select',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      const codes = store.push({
        data: [
          qualification(AFVALINTERCOMMUNALE, 'Afvalintercommunale'),
          qualification(DISTRIBUTIENETBEHEERDER, 'Distributienetbeheerder'),
          qualification(NONE, 'Geen bijkomende kwalificatie'),
        ],
      });
      sinon.stub(store, 'request').resolves({ content: codes });
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    test('it lists the additional qualification codes, with the "Geen" marker last', async function (assert) {
      await render(
        <template>
          <AdditionalQualificationsMultipleSelect @onChange={{noopOnChange}} />
        </template>,
      );

      await clickTrigger();

      assert.deepEqual(
        findAll('.ember-power-select-option').map((option) =>
          option.textContent.trim(),
        ),
        [
          'Afvalintercommunale',
          'Distributienetbeheerder',
          'Geen bijkomende kwalificatie',
        ],
      );
    });

    test('it preselects the qualification codes matching the selected ids', async function (assert) {
      this.selected = `${AFVALINTERCOMMUNALE},${NONE}`;

      await render(
        <template>
          <AdditionalQualificationsMultipleSelect
            @selected={{this.selected}}
            @onChange={{noopOnChange}}
          />
        </template>,
      );

      const selected = selectedMultipleOptionLabels();

      assert.strictEqual(selected.length, 2);
      assert.ok(selected.includes('Afvalintercommunale'));
      assert.ok(selected.includes('Geen bijkomende kwalificatie'));
    });
  },
);
