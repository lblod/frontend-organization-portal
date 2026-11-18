import PageHeader from 'frontend-organization-portal/components/page-header';
import readOnly from 'frontend-organization-portal/helpers/read-only';
import EditsDisabledMessage from 'frontend-organization-portal/components/edits-disabled-message';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import SecuredArea from 'frontend-organization-portal/components/secured-area';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import DataCard from 'frontend-organization-portal/components/data-card';
import dateFormat from 'frontend-organization-portal/helpers/date-format';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table-th-sortable';
import { array } from '@ember/helper';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box au-o-flow au-o-flow--large">
      <PageHeader>
        <:title>
          Bestuursorgaan:
          {{@model.governingBodyClassification.label}}
        </:title>
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
                    @route="organizations.organization.governing-bodies.governing-body.edit"
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

      <DataCard>
        <:title>Bestuursorgaan</:title>
        <:card as |Card|>
          <Card.Columns>
            <:left as |Item|>
              <Item>
                <:label>Type</:label>
                <:content>
                  {{@model.governingBodyClassification.label}}
                </:content>
              </Item>
              {{#if @model.governingBody.period}}
                <Item>
                  <:label>Termijn</:label>
                  <:content>
                    Bestuursperiode
                    {{@model.governingBody.period}}
                  </:content>
                </Item>
              {{/if}}
            </:left>
            <:right as |Item|>
              {{#if @model.governingBody.startDate}}
                <Item>
                  <:label>Startdatum</:label>
                  <:content>
                    {{dateFormat @model.governingBody.startDate}}
                  </:content>
                </Item>
              {{/if}}
              {{#if @model.governingBody.endDate}}
                <Item>
                  <:label>Einddatum</:label>
                  <:content>
                    {{dateFormat @model.governingBody.endDate}}
                  </:content>
                </Item>
              {{/if}}
            </:right>
          </Card.Columns>
        </:card>
      </DataCard>

      {{#unless @controller.showCombinedTable}}
        <div>
          <AuToolbar class="au-u-margin-bottom-small">
            <AuHeading @level="4" @skin="5">Bestuursleden</AuHeading>
          </AuToolbar>
          <AuDataTable
            @content={{@model.memberMandatories}}
            @noDataMessage="Geen bestuursleden"
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
                  @field="mandate.role-board.label"
                  @currentSorting={{@controller.sort}}
                  @label="Mandaat"
                />
                <AuDataTableThSortable
                  @field="status"
                  @currentSorting={{@controller.sort}}
                  @label="Status mandaat"
                />
                <AuDataTableThSortable
                  @field="start-date"
                  @currentSorting={{@controller.sort}}
                  @label="Start mandaat"
                />
                {{#if @model.organization.isWorshipAdministrativeUnit}}
                  <th>Geplande einddatum</th>
                {{/if}}
                <AuDataTableThSortable
                  @field="end-date"
                  @currentSorting={{@controller.sort}}
                  @label="Einddatum"
                />
              </c.header>
              <c.body as |mandatory|>
                <td>
                  <AuLink
                    @route="people.person"
                    @model={{mandatory.governingAlias.id}}
                  >
                    {{mandatory.governingAlias.givenName}}
                  </AuLink>
                </td>
                <td>
                  <AuLink
                    @route="people.person"
                    @model={{mandatory.governingAlias.id}}
                  >
                    {{mandatory.governingAlias.familyName}}
                  </AuLink>
                </td>
                <td>
                  <AuLink
                    @route="people.person.positions.mandatory"
                    @models={{array mandatory.governingAlias.id mandatory.id}}
                  >
                    {{mandatory.mandate.roleBoard.label}}
                  </AuLink>
                </td>
                <td>
                  {{mandatory.status.label}}
                </td>
                <td>
                  {{#if mandatory.startDate}}
                    {{dateFormat mandatory.startDate}}
                  {{/if}}
                </td>
                {{#if @model.organization.isWorshipAdministrativeUnit}}
                  <td>
                    {{#if mandatory.expectedEndDate}}
                      {{dateFormat mandatory.expectedEndDate}}
                    {{/if}}
                  </td>
                {{/if}}
                <td>
                  {{#if mandatory.endDate}}
                    {{dateFormat mandatory.endDate}}
                  {{/if}}
                </td>
              </c.body>
            </t.content>
          </AuDataTable>
        </div>
      {{/unless}}

      <div>
        <AuToolbar class="au-u-margin-bottom-small">
          <AuHeading @level="4" @skin="5">Mandatarissen</AuHeading>
        </AuToolbar>
        <AuDataTable
          @content={{if
            @controller.showCombinedTable
            @model.allMandatories
            @model.otherMandatories
          }}
          @page={{@controller.mandatoriesPage}}
          @size={{@controller.size}}
          @noDataMessage="Geen mandatarissen"
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
                @field="mandate.role-board.label"
                @currentSorting={{@controller.sort}}
                @label="Mandaat"
              />
              <AuDataTableThSortable
                @field="status"
                @currentSorting={{@controller.sort}}
                @label="Status mandaat"
              />
              <AuDataTableThSortable
                @field="start-date"
                @currentSorting={{@controller.sort}}
                @label="Start mandaat"
              />
              {{#if @model.organization.isWorshipAdministrativeUnit}}
                <th>Geplande einddatum</th>
              {{/if}}
              <AuDataTableThSortable
                @field="end-date"
                @currentSorting={{@controller.sort}}
                @label="Einddatum"
              />
            </c.header>
            <c.body as |mandatory|>
              <td>
                <AuLink
                  @route="people.person"
                  @model={{mandatory.governingAlias.id}}
                >
                  {{mandatory.governingAlias.givenName}}
                </AuLink>
              </td>
              <td>
                <AuLink
                  @route="people.person"
                  @model={{mandatory.governingAlias.id}}
                >
                  {{mandatory.governingAlias.familyName}}
                </AuLink>
              </td>
              <td>
                <AuLink
                  @route="people.person.positions.mandatory"
                  @models={{array mandatory.governingAlias.id mandatory.id}}
                >
                  {{mandatory.mandate.roleBoard.label}}
                </AuLink>
              </td>
              <td>
                {{mandatory.status.label}}
              </td>
              <td>
                {{#if mandatory.startDate}}
                  {{dateFormat mandatory.startDate}}
                {{/if}}
              </td>
              {{#if @model.organization.isWorshipAdministrativeUnit}}
                <td>
                  {{#if mandatory.expectedEndDate}}
                    {{dateFormat mandatory.expectedEndDate}}
                  {{/if}}
                </td>
              {{/if}}
              <td>
                {{#if mandatory.endDate}}
                  {{dateFormat mandatory.endDate}}
                {{/if}}
              </td>
            </c.body>
          </t.content>
        </AuDataTable>
      </div>
    </div>
  </div>
</template>
