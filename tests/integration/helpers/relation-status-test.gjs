import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { render, settled } from '@ember/test-helpers';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import relationStatus from 'frontend-organization-portal/helpers/relation-status';

module('Integration | Helper | relation-status', function (hooks) {
  setupRenderingTest(hooks);

  test('it derives the status from the named arguments', async function (assert) {
    this.set('startDate', undefined);
    this.set('endDate', undefined);
    this.set('statusId', ORGANIZATION_STATUS.ACTIVE);

    await render(
      <template>
        {{#let
          (relationStatus
            startDate=this.startDate
            endDate=this.endDate
            memberStatusId=this.statusId
            organizationStatusId=this.statusId
          )
          as |status|
        }}
          {{status.label}}
        {{/let}}
      </template>,
    );
    assert.dom(this.element).hasText('Actief');

    this.set('endDate', new Date('2024-01-01'));
    await settled();
    assert.dom(this.element).hasText('Niet actief');

    this.set('endDate', undefined);
    this.set('startDate', new Date('2999-12-31'));
    await settled();
    assert.dom(this.element).hasText('Niet actief');

    this.set('startDate', new Date('2024-01-01'));
    await settled();
    assert.dom(this.element).hasText('Actief');
  });
});
