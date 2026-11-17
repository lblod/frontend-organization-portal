import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import paramsFor from '../../../helpers/params-for';
import PageHeader from '../../../components/page-header';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table-th-sortable';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { array } from '@ember/helper';
import dateFormat from '../../../helpers/date-format';

<template>
  {{pageTitle "Leidinggevenden"}}

  {{breadcrumb
    "Leidinggevenden"
    route="organizations.organization.executives"
    model=(paramsFor "organizations.organization" param="id")
  }}

  <PageHeader class="au-o-box">
    <:title>Leidinggevenden</:title>
    <:subtitle>{{@model.organization.abbName}}
      ({{@model.organization.classification.label}})</:subtitle>
  </PageHeader>

  <AuDataTable
    @content={{@model.functionaries}}
    @noDataMessage="Geen functionarissen"
    @page={{@controller.page}}
    @size={{@controller.size}}
    as |t|
  >
    <t.content as |c|>
      <c.header>
        <AuDataTableThSortable
          @field="governing-alias.given-name"
          @currentSorting={{@controller.sort}}
          @label="Voornaam"
        />
        <AuDataTableThSortable
          @field="governing-alias.family-name"
          @currentSorting={{@controller.sort}}
          @label="Achternaam"
        />
        <AuDataTableThSortable
          @field="board-position.role-board.label"
          @currentSorting={{@controller.sort}}
          @label="Rol"
        />
        <AuDataTableThSortable
          @field="status.label"
          @currentSorting={{@controller.sort}}
          @label="Status"
        />
        <AuDataTableThSortable
          @field="start-date"
          @currentSorting={{@controller.sort}}
          @label="Start periode"
        />
        <AuDataTableThSortable
          @field="end-date"
          @currentSorting={{@controller.sort}}
          @label="Einde periode"
        />
      </c.header>
      <c.body as |functionary|>
        <td>
          <AuLink
            @route="people.person"
            @model={{functionary.governingAlias.id}}
          >
            {{functionary.governingAlias.givenName}}
          </AuLink>
        </td>
        <td>
          <AuLink
            @route="people.person"
            @model={{functionary.governingAlias.id}}
          >
            {{functionary.governingAlias.familyName}}
          </AuLink>
        </td>
        <td>
          <AuLink
            @route="people.person.positions.functionary"
            @models={{array functionary.governingAlias.id functionary.id}}
          >
            {{functionary.boardPosition.roleBoard.label}}
          </AuLink>
        </td>
        <td>
          {{functionary.status.label}}
        </td>
        <td>
          {{dateFormat functionary.startDate}}
        </td>
        <td>
          {{dateFormat functionary.endDate}}
        </td>
      </c.body>
    </t.content>
  </AuDataTable>
</template>
