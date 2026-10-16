import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';

module('Integration | Helper | relation-status', function (hooks) {
  setupRenderingTest(hooks);

  test('it derives the status from the named arguments', async function (assert) {
    this.set('endDate', undefined);
    this.set('statusId', ORGANIZATION_STATUS.ACTIVE);

    await render(hbs`
      {{#let
        (relation-status
          endDate=this.endDate
          memberStatusId=this.statusId
          organizationStatusId=this.statusId
        )
        as |status|
      }}
        {{status.label}}
      {{/let}}
    `);
    assert.dom(this.element).hasText('Actief');

    this.set('endDate', new Date('2024-01-01'));
    await settled();
    assert.dom(this.element).hasText('Niet actief');
  });
});
