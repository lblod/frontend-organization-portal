import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { findAll, render } from '@ember/test-helpers';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { selectedMultipleOptionLabels } from 'frontend-organization-portal/tests/helpers/power-select';
import ContentThemeSelect from 'frontend-organization-portal/components/content-theme-select';

const WASTE = '54663344-b7c9-497d-aa9e-6c723ba2f1ec';
const ANIMAL_WELFARE = 'fab150c6-6956-4f41-8d59-56b4365ec5c9';

function contentTheme(id, label) {
  return { id, type: 'concept', attributes: { label } };
}

const noopOnChange = () => {};

module('Integration | Component | content-theme-select', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const concepts = store.push({
      data: [
        contentTheme(WASTE, 'Afval en/of recyclage'),
        contentTheme(ANIMAL_WELFARE, 'Dierenwelzijn'),
      ],
    });
    sinon.stub(store, 'request').resolves({ content: concepts });
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('it lists the content themes of the "Inhoudelijk thema" concept scheme', async function (assert) {
    await render(
      <template><ContentThemeSelect @onChange={{noopOnChange}} /></template>,
    );

    await clickTrigger();

    assert.deepEqual(
      findAll('.ember-power-select-option').map((option) =>
        option.textContent.trim(),
      ),
      ['Afval en/of recyclage', 'Dierenwelzijn'],
    );
  });

  test('it preselects the content themes matching the selected ids when a string is passed', async function (assert) {
    this.selected = `${WASTE},${ANIMAL_WELFARE}`;

    await render(
      <template>
        <ContentThemeSelect
          @selected={{this.selected}}
          @onChange={{noopOnChange}}
        />
      </template>,
    );

    const selected = selectedMultipleOptionLabels();

    assert.strictEqual(selected.length, 2);
    assert.ok(selected.includes('Afval en/of recyclage'));
    assert.ok(selected.includes('Dierenwelzijn'));
  });
});
