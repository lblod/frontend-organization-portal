import PageHeader from 'frontend-organization-portal/components/page-header';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table-th-sortable';
import eq from 'ember-truth-helpers/helpers/eq';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { array } from '@ember/helper';
import gt from 'ember-truth-helpers/helpers/gt';
import PositionStatus from 'frontend-organization-portal/components/position-status';

<template>
  <PageHeader class="au-o-box">
    <:title>Posities</:title>
    <:subtitle>
      {{@model.person.givenName}}
      {{@model.person.familyName}}
    </:subtitle>
  </PageHeader>

  <AuDataTable
    @content={{@model.positions}}
    @noDataMessage="Geen posities"
    @page={{@controller.page}}
    @size={{@controller.size}}
    as |t|
  >
    <t.content as |c|>
      <c.header>
        <AuDataTableThSortable
          @class="au-c-data-table__header-title"
          @field="position.role"
          @currentSorting={{@controller.sort}}
          @label="Positie"
        />
        <AuDataTableThSortable
          @class="au-c-data-table__header-title"
          @field="position.status"
          @currentSorting={{@controller.sort}}
          @label="Status positie"
        />
        <AuDataTableThSortable
          @class="au-c-data-table__header-title"
          @field="position.administrative-unit.name"
          @currentSorting={{@controller.sort}}
          @label="Organisatie(s)"
        />
        <AuDataTableThSortable
          @class="au-c-data-table__header-title"
          @field="position.status"
          @currentSorting={{@controller.sort}}
          @label="Status"
        />
      </c.header>
      <c.body as |position|>
        <td>
          {{#if (eq position.type "minister")}}
            <AuLink
              @route="people.person.positions.minister"
              @models={{array @model.person.id position.id}}
            >
              {{position.role}}
            </AuLink>
          {{else if (eq position.type "mandatory")}}
            <AuLink
              @route="people.person.positions.mandatory"
              @models={{array @model.person.id position.id}}
            >
              {{position.role}}
            </AuLink>
          {{else}}
            <AuLink
              @route="people.person.positions.functionary"
              @models={{array @model.person.id position.id}}
            >
              {{position.role}}
            </AuLink>
          {{/if}}
        </td>
        <td>{{position.status.label}}</td>
        <td>
          {{#if position.administrativeUnit}}
            <AuLink
              @route="organizations.organization"
              @model={{position.administrativeUnit.id}}
            >
              {{position.administrativeUnit.abbName}}
            </AuLink>
          {{else}}
            {{#each position.administrativeUnits as |administrativeUnit index|}}
              <AuLink
                @route="organizations.organization"
                @model={{administrativeUnit.id}}
              >
                {{administrativeUnit.abbName}}
                ({{administrativeUnit.classification.label}})
              </AuLink>
              {{#if (gt position.administrativeUnits.length 1)}}
                {{unless index "/"}}
              {{/if}}
            {{/each}}
          {{/if}}
        </td>
        <td>
          <PositionStatus @endDate={{position.endDate}} />
        </td>
      </c.body>
    </t.content>
  </AuDataTable>
</template>
