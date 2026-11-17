import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { RELATION_STATUS } from 'frontend-organization-portal/utils/relation-status';
import { VLAAMSE_REGERING_ID } from 'frontend-organization-portal/constants/special-organizations';

module(
  'Integration | Component | related-organizations-view-table',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it shows the relations with their dates and statuses', async function (assert) {
      // Links need the router
      this.owner.setupRouter();

      const active = { id: ORGANIZATION_STATUS.ACTIVE, label: 'Actief' };
      // Rows as the index route builds them
      this.setProperties({
        model: {
          relatedOrganizations: [
            {
              role: 'Is lid van',
              organizationType: 'Projectvereniging',
              organizationId: 'igs',
              organizationName: 'IGS Zuid',
              organizationStatus: active,
              isSpecialOrganization: false,
              startDate: new Date('2020-01-01'),
              endDate: undefined,
              relationStatus: RELATION_STATUS.ACTIVE,
            },
            {
              role: 'Is opgericht door',
              organizationType: 'Vlaamse regering',
              organizationId: VLAAMSE_REGERING_ID,
              organizationName: 'Vlaamse regering',
              organizationStatus: active,
              isSpecialOrganization: true,
              startDate: new Date('2010-01-01'),
              endDate: new Date('2015-12-31'),
              relationStatus: RELATION_STATUS.INACTIVE,
            },
          ],
          selectableRoleLabels: ['Is lid van'],
        },
        selectedRole: null,
        organizationStatus: true,
        noop: () => {},
      });

      await render(hbs`
        <RelatedOrganizationsViewTable
          @model={{this.model}}
          @sort="name"
          @page={{0}}
          @size={{500}}
          @organizationStatus={{this.organizationStatus}}
          @onOrganizationStatusChange={{this.noop}}
          @selectedRole={{this.selectedRole}}
        />
      `);

      assert.dom('tbody tr').exists({ count: 2 });

      const [igs, government] = this.element.querySelectorAll('tbody tr');
      assert.dom('td:nth-child(1)', igs).hasText('Is lid van');
      assert.dom('td:nth-child(2)', igs).hasText('Projectvereniging');
      assert.dom('td:nth-child(3) a', igs).hasText('IGS Zuid');
      assert.dom('td:nth-child(4) .au-c-pill--success', igs).hasText('Actief');
      assert.dom('td:nth-child(5)', igs).hasText('01-01-2020');
      assert.dom('td:nth-child(6)', igs).hasText('');
      assert.dom('td:nth-child(7) .au-c-pill--success', igs).hasText('Actief');

      // Special organizations have no detail page, so no link
      assert.dom('td:nth-child(3) a', government).doesNotExist();
      assert.dom('td:nth-child(3)', government).hasText('Vlaamse regering');
      assert.dom('td:nth-child(5)', government).hasText('01-01-2010');
      assert.dom('td:nth-child(6)', government).hasText('31-12-2015');
      assert
        .dom('td:nth-child(7) .au-c-pill--error', government)
        .hasText('Niet actief');

      // The sortable headers and the filters are there
      assert.dom('thead th').exists({ count: 7 });
      assert.dom('.au-c-toggle-switch, [type="checkbox"]').exists();
    });
  },
);
