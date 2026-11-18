import PageHeader from 'frontend-organization-portal/components/page-header';
import readOnly from 'frontend-organization-portal/helpers/read-only';
import EditsDisabledMessage from 'frontend-organization-portal/components/edits-disabled-message';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import editableContactData from 'frontend-organization-portal/helpers/editable-contact-data';
import SecuredArea from 'frontend-organization-portal/components/secured-area';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import SiteTypeWithName from 'frontend-organization-portal/components/site-type-with-name';
import eq from 'ember-truth-helpers/helpers/eq';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';

<template>
  <PageHeader class="au-o-box">
    <:title>Vestigingen</:title>
    <:subtitle>{{@model.organization.abbName}}
      ({{@model.organization.classification.label}})</:subtitle>
    <:action>
      <div class="au-u-text-right">
        {{#if (readOnly)}}
          <EditsDisabledMessage />
          <ReportWrongData />
        {{else if (editableContactData @model.organization)}}
          <SecuredArea>
            <:edit>
              <AuLink
                @route="organizations.organization.sites.new"
                @icon="add"
                @iconAlignment="left"
                @skin="button"
              >
                Nieuw
              </AuLink>
            </:edit>
            <:readOnly>
              <ReportWrongData />
            </:readOnly>
          </SecuredArea>
        {{else}}
          <ReportWrongData />
        {{/if}}
      </div>
    </:action>
  </PageHeader>

  <AuDataTable
    @content={{@controller.sites}}
    @noDataMessage="Geen vestigingen"
    as |t|
  >
    <t.content as |c|>
      <c.header>
        <th class="au-c-data-table__header-title">Locatie</th>
        <th class="au-c-data-table__header-title">Type vestiging</th>
        <th class="au-c-data-table__header-title">Primair correspondentieadres
        </th>
        <SecuredArea>
          <:edit>
            <th></th>
          </:edit>
        </SecuredArea>
      </c.header>
      <c.body as |site|>
        <td>
          <AuLink
            @model={{site.id}}
            @route="organizations.organization.sites.site"
          >
            {{site.address.fullAddress}}
          </AuLink>
        </td>
        <td>
          <SiteTypeWithName @site={{site}} />
        </td>
        <td>{{if
            (eq site.id @controller.model.primarySite.id)
            "Ja"
            "Neen"
          }}</td>
        <SecuredArea>
          <:edit>
            <td>
              {{#if
                (and (not (readOnly)) (editableContactData @model.organization))
              }}
                <AuLink
                  @model={{site.id}}
                  @route="organizations.organization.sites.site.edit"
                >
                  Bewerk
                </AuLink>
              {{/if}}
            </td>
          </:edit>
        </SecuredArea>
      </c.body>
    </t.content>
  </AuDataTable>
</template>
