import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';

module(
  'Integration | Component | related-organizations-edit-table',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it warns on a row that repeats a stored relation', async function (assert) {
      const store = this.owner.lookup('service:store');
      const [organization, other, role] = store.push({
        data: [
          {
            type: 'organization',
            id: 'organization',
            attributes: { name: 'Organisatie' },
          },
          {
            type: 'organization',
            id: 'other',
            attributes: { name: 'Andere organisatie' },
          },
          {
            type: 'membership-role',
            id: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
            attributes: {},
          },
        ],
      });
      const membership = store.createRecord('membership', {
        member: organization,
        organization: other,
        role,
      });

      this.setProperties({
        model: {
          organization,
          allowedRoleLabels: [],
          selectableRoleLabels: [],
        },
        memberships: [membership],
        selectedRole: null,
        noop: () => {},
        // Stands in for the controller's removal task
        remove: { perform() {}, isRunning: false },
        displayRoleLabel: (row) => row.getRoleLabelForPerspective(organization),
        isDuplicateMembership: (row) => row === membership,
      });

      await render(hbs`
        <RelatedOrganizationsEditTable
          @model={{this.model}}
          @content={{this.memberships}}
          @page={{0}}
          @size={{500}}
          @addRelatedOrganization={{this.noop}}
          @removeRelatedOrganization={{this.remove}}
          @updateMembershipRole={{this.noop}}
          @displayRoleLabel={{this.displayRoleLabel}}
          @setOtherRelatedOrganization={{this.noop}}
          @setStartDate={{this.noop}}
          @setEndDate={{this.noop}}
          @selectedRole={{this.selectedRole}}
          @unsavedEdit={{false}}
          @isDuplicateMembership={{this.isDuplicateMembership}}
        />
      `);

      assert.dom('tbody tr').exists({ count: 1 });
      assert
        .dom('.au-c-help-text--warning')
        .hasText(
          'Je maakt een relatie aan die reeds bestaat, deze nieuwe relatie zal niet worden opgeslagen',
        );

      this.set('isDuplicateMembership', () => false);
      await settled();

      assert.dom('.au-c-help-text--warning').doesNotExist();
    });

    test('it shows a stored relation read-only with its dates and status', async function (assert) {
      const store = this.owner.lookup('service:store');
      const classification = (code) => ({
        type: 'administrative-unit-classification-code',
        id: code.id,
        attributes: { label: code.label },
      });
      const administrativeUnit = (id, name, code) => ({
        type: 'administrative-unit',
        id,
        attributes: { name },
        relationships: {
          classification: {
            data: {
              type: 'administrative-unit-classification-code',
              id: code.id,
            },
          },
          organizationStatus: {
            data: {
              type: 'organization-status-code',
              id: ORGANIZATION_STATUS.ACTIVE,
            },
          },
        },
      });
      // A province and a municipality with the generic relation the
      // migrations manage: the user cannot remove it.
      const [, , , province, , , membership] = store.push({
        data: [
          {
            type: 'organization-status-code',
            id: ORGANIZATION_STATUS.ACTIVE,
            attributes: { label: 'Actief' },
          },
          classification(CLASSIFICATION.PROVINCE),
          classification(CLASSIFICATION.MUNICIPALITY),
          administrativeUnit('province', 'Provincie', CLASSIFICATION.PROVINCE),
          administrativeUnit(
            'municipality',
            'Gemeente',
            CLASSIFICATION.MUNICIPALITY,
          ),
          {
            type: 'membership-role',
            id: MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
            attributes: {},
          },
          {
            type: 'membership',
            id: 'membership',
            relationships: {
              member: {
                data: { type: 'administrative-unit', id: 'municipality' },
              },
              organization: {
                data: { type: 'administrative-unit', id: 'province' },
              },
              role: {
                data: {
                  type: 'membership-role',
                  id: MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
                },
              },
              during: { data: { type: 'period-of-time', id: 'period' } },
            },
          },
          {
            type: 'period-of-time',
            id: 'period',
            attributes: {
              startDate: new Date('2010-01-01'),
              endDate: new Date('2015-12-31'),
            },
          },
        ],
      });

      this.setProperties({
        model: {
          organization: province,
          allowedRoleLabels: [],
          selectableRoleLabels: [],
        },
        memberships: [membership],
        selectedRole: null,
        noop: () => {},
        remove: { perform() {}, isRunning: false },
        displayRoleLabel: (row) => row.getRoleLabelForPerspective(province),
        isDuplicateMembership: () => false,
      });

      await render(hbs`
        <RelatedOrganizationsEditTable
          @model={{this.model}}
          @content={{this.memberships}}
          @page={{0}}
          @size={{500}}
          @addRelatedOrganization={{this.noop}}
          @removeRelatedOrganization={{this.remove}}
          @updateMembershipRole={{this.noop}}
          @displayRoleLabel={{this.displayRoleLabel}}
          @setOtherRelatedOrganization={{this.noop}}
          @setStartDate={{this.noop}}
          @setEndDate={{this.noop}}
          @selectedRole={{this.selectedRole}}
          @unsavedEdit={{false}}
          @isDuplicateMembership={{this.isDuplicateMembership}}
        />
      `);

      assert.dom('tbody tr').exists({ count: 1 });
      // The role and the organization of a stored relation cannot change: a
      // disabled select has no tabindex
      assert.dom('tbody .ember-power-select-trigger').exists({ count: 2 });
      assert.dom('tbody .ember-power-select-trigger[tabindex]').doesNotExist();
      assert.dom('tbody td:nth-child(2)').hasText('Gemeente');
      assert.dom('tbody td:nth-child(4) .au-c-pill--success').hasText('Actief');
      // The dates are shown in the date pickers
      const [startDate, endDate] = this.element.querySelectorAll('tbody input');
      assert.true(startDate.value.includes('2010'), startDate.value);
      assert.true(endDate.value.includes('2015'), endDate.value);
      // Ended, so not active
      assert
        .dom('tbody td:nth-child(7) .au-c-pill--error')
        .hasText('Niet actief');
      assert.dom('tbody button').hasText('Verwijder').isDisabled();
    });
  },
);
