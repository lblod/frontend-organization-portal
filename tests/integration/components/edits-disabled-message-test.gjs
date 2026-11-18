import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { render } from '@ember/test-helpers';
import { setFeatures } from 'frontend-organization-portal/tests/helpers/feature-flags';
import EditsDisabledMessage from 'frontend-organization-portal/components/edits-disabled-message';

module('Integration | Component | edits-disabled-message', function (hooks) {
  setupRenderingTest(hooks);

  test('it points to the Lokale Verkenner and the helpdesk for non-worship users when the flag is on', async function (assert) {
    setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
    this.owner.lookup('service:role')._activeRole =
      'ABBOrganisatiePortaalGebruiker-editeerder';

    await render(<template><EditsDisabledMessage /></template>);

    assert
      .dom()
      .includesText('Bewerken kan niet meer in het OrganisatiePortaal.');
    assert
      .dom('a[href="https://lokaleverkenner.lokaalbestuur.vlaanderen.be"]')
      .exists()
      .hasText('Lokale Verkenner');
    assert
      .dom('a[href="mailto:LoketLokaalBestuur@vlaanderen.be"]')
      .exists()
      .hasText('helpdesk');
  });

  test('it renders nothing for worship users when the flag is on', async function (assert) {
    setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
    this.owner.lookup('service:role')._activeRole =
      'ABBOrganisatiePortaalErediensten-editeerder';

    await render(<template><EditsDisabledMessage /></template>);

    assert.dom().hasNoText();
  });

  test('it renders nothing when the flag is off', async function (assert) {
    setFeatures(this.owner, { 'disable-rvs-organizations-edits': false });

    await render(<template><EditsDisabledMessage /></template>);

    assert.dom().hasNoText();
  });

  test('it renders nothing for users who can only read when the flag is on', async function (assert) {
    setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
    this.owner.lookup('service:role')._activeRole =
      'ABBOrganisatiePortaalGebruiker-lezer';

    await render(<template><EditsDisabledMessage /></template>);

    assert.dom().hasNoText();
  });
});
