import PageHeader from 'frontend-organization-portal/components/page-header';
import readOnly from 'frontend-organization-portal/helpers/read-only';
import EditsDisabledMessage from 'frontend-organization-portal/components/edits-disabled-message';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import editableContactData from 'frontend-organization-portal/helpers/editable-contact-data';
import SecuredArea from 'frontend-organization-portal/components/secured-area';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import DataCard from 'frontend-organization-portal/components/data-card';
import and from 'ember-truth-helpers/helpers/and';
import eq from 'ember-truth-helpers/helpers/eq';
import ContactDataCard from 'frontend-organization-portal/components/site/contact-data-card';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box au-o-flow au-o-flow--large">
      <PageHeader>
        <:title>Vestiging: {{@model.site.address.fullAddress}}</:title>
        <:subtitle>{{@model.organization.abbName}}</:subtitle>
        <:action>
          <div class="au-u-text-right">
            {{#if (readOnly)}}
              <EditsDisabledMessage />
              <ReportWrongData />
            {{else if (editableContactData @model.organization)}}
              <SecuredArea>
                <:edit>
                  <AuLink
                    @route="organizations.organization.sites.site.edit"
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
            {{else}}
              <ReportWrongData />
            {{/if}}
          </div>
        </:action>
      </PageHeader>

      <DataCard>
        <:title>Kerngegevens</:title>
        <:card as |Card|>
          <Card.Columns>
            <:left as |Item|>
              <Item>
                <:label>Type vestiging</:label>
                <:content>{{@model.site.siteType.label}}</:content>
              </Item>
              {{#if (and @model.site.isOtherSite @model.site.siteTypeName)}}
                <Item>
                  <:label>Naam</:label>
                  <:content>{{@model.site.siteTypeName}}</:content>
                </Item>
              {{/if}}
            </:left>
            <:right as |Item|>
              <Item>
                <:label>Primair correspondentieadres</:label>
                <:content>{{if
                    (eq @model.site.id @model.organization.primarySite.id)
                    "Ja"
                    "Nee"
                  }}
                </:content>
              </Item>
            </:right>

          </Card.Columns>
        </:card>
      </DataCard>

      <ContactDataCard
        @address={{@model.site.address}}
        @primaryContact={{@model.primaryContact}}
        @secondaryContact={{@model.secondaryContact}}
      >
        <:title>Contactgegevens</:title>
      </ContactDataCard>
    </div>
  </div>
</template>
