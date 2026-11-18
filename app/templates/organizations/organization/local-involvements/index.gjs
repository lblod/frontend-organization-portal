import PageHeader from 'frontend-organization-portal/components/page-header';
import readOnly from 'frontend-organization-portal/helpers/read-only';
import EditsDisabledMessage from 'frontend-organization-portal/components/edits-disabled-message';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import SecuredArea from 'frontend-organization-portal/components/secured-area';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table-th-sortable';

<template>
  <PageHeader class="au-o-box">
    <:title>Betrokken lokale besturen</:title>
    <:subtitle>{{@model.organization.abbName}}
      ({{@model.organization.classification.label}})</:subtitle>
    <:action>
      <div class="au-u-text-right">
        {{#if (readOnly)}}
          <EditsDisabledMessage />
          <ReportWrongData />
        {{else}}
          <SecuredArea>
            <:edit>
              <AuLink
                @route="organizations.organization.local-involvements.edit"
                @skin="button-secondary"
                @icon="pencil"
                @iconAlignment="left"
              >
                Bewerk
              </AuLink>
            </:edit>
            <:readOnly>
              <ReportWrongData />
            </:readOnly>
          </SecuredArea>
        {{/if}}
      </div>
    </:action>
  </PageHeader>

  <AuDataTable
    @content={{@model.involvements}}
    @noDataMessage="Geen betrokken lokale besturen"
    @sort={{@controller.sort}}
    @page={{@controller.page}}
    @size={{@controller.size}}
    as |t|
  >
    <t.content as |c|>
      <c.header>
        <AuDataTableThSortable
          @field="administrative-unit.name"
          @currentSorting={{@controller.sort}}
          @label="Naam"
        />
        <AuDataTableThSortable
          @field="administrative-unit.classification.label"
          @currentSorting={{@controller.sort}}
          @label="Type instelling"
        />
        <AuDataTableThSortable
          @field="involvement-type.label"
          @currentSorting={{@controller.sort}}
          @label="Type betrokkenheid"
        />
        {{#if @model.organization.isWorshipService}}
          <AuDataTableThSortable
            @field="percentage"
            @currentSorting={{@controller.sort}}
            @label="Financieel percentage"
          />
        {{/if}}
      </c.header>
      <c.body as |involvement|>
        <td>{{involvement.administrativeUnit.abbName}}</td>
        <td>{{involvement.administrativeUnit.classification.label}}</td>
        <td>{{involvement.involvementType.label}}</td>
        {{#if @model.organization.isWorshipService}}
          <td>{{involvement.percentage}}%</td>
        {{/if}}
      </c.body>
    </t.content>
  </AuDataTable>
</template>
