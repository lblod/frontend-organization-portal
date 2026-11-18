import PageHeader from 'frontend-organization-portal/components/page-header';
import SecuredArea from 'frontend-organization-portal/components/secured-area';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { array } from '@ember/helper';
import PositionStatus from 'frontend-organization-portal/components/position-status';

<template>
  <PageHeader class="au-o-box">
    <:title>Bedienaren</:title>
    <:subtitle>{{@model.organization.abbName}}</:subtitle>
    <:action>
      <SecuredArea>
        <:readOnly>
          <ReportWrongData />
        </:readOnly>
      </SecuredArea>
    </:action>
  </PageHeader>

  <AuDataTable
    @content={{@model.ministers}}
    @noDataMessage="Geen bedienaren"
    as |t|
  >
    <t.content as |c|>
      <c.header>
        <th class="au-c-data-table__header-title">Voornaam</th>
        <th class="au-c-data-table__header-title">Achternaam</th>
        <th class="au-c-data-table__header-title">Rol</th>
        <th class="au-c-data-table__header-title">Status</th>
      </c.header>
      <c.body as |minister|>
        <td>
          <AuLink @route="people.person" @model={{minister.person.id}}>
            {{minister.person.givenName}}
          </AuLink>
        </td>
        <td>
          <AuLink @route="people.person" @model={{minister.person.id}}>
            {{minister.person.familyName}}
          </AuLink>
        </td>
        <td>
          <AuLink
            @route="people.person.positions.minister"
            @models={{array minister.person.id minister.id}}
          >
            {{minister.ministerPosition.function.label}}
          </AuLink>
        </td>
        <td>
          <PositionStatus @endDate={{minister.agentEndDate}} />
        </td>
      </c.body>
    </t.content>
  </AuDataTable>
</template>
