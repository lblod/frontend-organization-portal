import PageHeader from '../../../../components/page-header';
import readOnly from '../../../../helpers/read-only';
import EditsDisabledMessage from '../../../../components/edits-disabled-message';
import ReportWrongData from '../../../../components/report-wrong-data';
import SecuredArea from '../../../../components/secured-area';
import NewButton from '../../../../components/button/new';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table-th-sortable';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import dateFormat from '../../../../helpers/date-format';
import OrganizationStatus from '../../../../components/organization-status';

<template>
  <PageHeader class="au-o-box">
    <:title>Veranderingsgebeurtenissen</:title>
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
              <NewButton
                @route="organizations.organization.change-events.new"
              />
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
    @content={{@model.changeEventResults}}
    @noDataMessage="Geen veranderingsgebeurtenissen"
    @isLoading={{@controller.showTableLoader}}
    @page={{@controller.page}}
    @size={{@controller.size}}
    as |t|
  >
    <t.content as |c|>
      <c.header>
        <AuDataTableThSortable
          @field="result-from.type.label"
          @currentSorting={{@controller.sort}}
          @label="Type veranderingsgebeurtenis"
        />
        <AuDataTableThSortable
          @field="result-from.date"
          @currentSorting={{@controller.sort}}
          @label="Datum"
        />
        <AuDataTableThSortable
          @field="result-from.description"
          @currentSorting={{@controller.sort}}
          @label="Beschrijving"
        />
        <AuDataTableThSortable
          @field="status.label"
          @currentSorting={{@controller.sort}}
          @label="Resulterende status"
        />
        {{#unless (readOnly)}}
          <SecuredArea>
            <:edit>
              <th></th>
            </:edit>
          </SecuredArea>
        {{/unless}}
      </c.header>
      <c.body as |changeEventResult|>
        {{#let changeEventResult.resultFrom as |changeEvent|}}
          <td>
            <AuLink
              @route="organizations.organization.change-events.details"
              @model={{changeEvent.id}}
            >
              {{changeEvent.type.label}}
            </AuLink>
          </td>
          <td>
            {{dateFormat changeEvent.date}}
          </td>
          <td>{{changeEvent.description}}</td>
          <td>
            <OrganizationStatus
              @id={{changeEventResult.status.id}}
              @label={{changeEventResult.status.label}}
            />
          </td>
          {{#unless (readOnly)}}
            <SecuredArea>
              <:edit>
                <td>
                  <AuLink
                    @route="organizations.organization.change-events.details.edit"
                    @model={{changeEvent.id}}
                  >
                    Bewerk
                  </AuLink>
                </td>
              </:edit>
            </SecuredArea>
          {{/unless}}
        {{/let}}
      </c.body>
    </t.content>
  </AuDataTable>
</template>
