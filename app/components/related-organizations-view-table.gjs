import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import or from 'ember-truth-helpers/helpers/or';
import AuToggleSwitch from '@appuniversum/ember-appuniversum/components/au-toggle-switch';
import { fn } from '@ember/helper';
import not from 'ember-truth-helpers/helpers/not';
import MembershipRoleSelect from './membership-role-select';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table-th-sortable';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import OrganizationStatus from './organization-status';
import dateFormat from 'frontend-organization-portal/helpers/date-format';

<template>
  <AuDataTable
    @content={{@model.relatedOrganizations}}
    @sort={{@sort}}
    @page={{@page}}
    @size={{@size}}
    @isLoading={{@isLoading}}
    @noDataMessage={{or @noDataMessage "Geen organisatie"}}
    as |t|
  >
    <t.menu as |menu|>
      <menu.general>
        {{! TODO: place next to each other }}
        <div class="au-o-box">
          <AuToggleSwitch
            @checked={{@organizationStatus}}
            @onChange={{fn
              @onOrganizationStatusChange
              (not @organizationStatus)
            }}
          >
            Verberg niet actieve organisaties
          </AuToggleSwitch>

          <MembershipRoleSelect
            @options={{@model.selectableRoleLabels}}
            @selected={{@selectedRole}}
            @onChange={{fn (mut @selectedRole)}}
            @allowClear={{true}}
          />
        </div>
      </menu.general>
    </t.menu>

    <t.content as |c|>
      <c.header>
        <AuDataTableThSortable
          @field="role.label"
          @label="Type relatie"
          @currentSorting={{@sort}}
        />
        <AuDataTableThSortable
          @field="classification.label"
          @label="Type organisatie"
          @currentSorting={{@sort}}
        />
        <AuDataTableThSortable
          @field="name"
          @label="Organisatie"
          @currentSorting={{@sort}}
        />
        {{! TODO: Use same grey as other non-sorted columns}}
        <th>Status organisatie</th>
        <AuDataTableThSortable
          @field="start-date"
          @label="Startdatum relatie"
          @currentSorting={{@sort}}
        />
        <AuDataTableThSortable
          @field="end-date"
          @label="Einddatum relatie"
          @currentSorting={{@sort}}
        />
        <AuDataTableThSortable
          @field="relation-status"
          @label="Status relatie"
          @currentSorting={{@sort}}
        />
      </c.header>

      <c.body as |organization|>
        <td>
          {{organization.role}}
        </td>
        <td>
          {{organization.organizationType}}
        </td>
        <td>
          {{#if organization.isSpecialOrganization}}
            {{organization.organizationName}}
          {{else}}
            <AuLink
              @route="organizations.organization"
              @model={{organization.organizationId}}
            >
              {{organization.organizationName}}
            </AuLink>
          {{/if}}
        </td>
        <td>
          <OrganizationStatus
            @id={{organization.organizationStatus.id}}
            @label={{organization.organizationStatus.label}}
          />
        </td>
        <td>
          {{if organization.startDate (dateFormat organization.startDate)}}
        </td>
        <td>
          {{if organization.endDate (dateFormat organization.endDate)}}
        </td>
        <td>
          <OrganizationStatus
            @id={{organization.relationStatus.id}}
            @label={{organization.relationStatus.label}}
          />
        </td>
      </c.body>
    </t.content>
  </AuDataTable>
</template>
