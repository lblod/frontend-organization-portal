import PageHeader from '../../../../../components/page-header';
import SecuredArea from '../../../../../components/secured-area';
import ReportWrongData from '../../../../../components/report-wrong-data';
import DataCard from '../../../../../components/data-card';
import HarvestMetaPopup from '../../../../../components/harvest-meta-popup';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import ContactDataCard from '../../../../../components/position/contact-data-card';
import or from 'ember-truth-helpers/helpers/or';
import dateFormat from '../../../../../helpers/date-format';
import receivesFinancing from '../../../../../helpers/receives-financing';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box au-o-flow au-o-flow--large">
      <PageHeader>
        <:title>
          Positie:
          {{@model.minister.ministerPosition.function.label}}
          <br />
          {{@model.minister.ministerPosition.worshipService.abbName}}
        </:title>
        <:subtitle>
          {{@model.person.givenName}}
          {{@model.person.familyName}}
        </:subtitle>
        <:action>
          <SecuredArea>
            <:readOnly>
              <ReportWrongData />
            </:readOnly>
          </SecuredArea>
        </:action>
      </PageHeader>

      <DataCard>
        <:title>
          Positie
          <HarvestMetaPopup @harvestable={{@model.minister}} />
        </:title>
        <:card as |Card|>
          <Card.Columns>
            <:left as |Item|>
              <Item>
                <:label>Type</:label>
                <:content>Bedienaar</:content>
              </Item>
              <Item>
                <:label>Rol</:label>
                <:content
                >{{@model.minister.ministerPosition.function.label}}</:content>
              </Item>
            </:left>
            <:right as |Item|>
              <Item>
                <:label>Naam eredienst</:label>
                <:content>
                  {{#let
                    @model.minister.ministerPosition.worshipService
                    as |organization|
                  }}
                    <AuLink
                      @route="organizations.organization"
                      @model={{organization.id}}
                    >
                      {{organization.abbName}}
                    </AuLink>
                  {{/let}}
                </:content>
              </Item>
            </:right>
          </Card.Columns>
        </:card>
      </DataCard>

      <ContactDataCard
        @address={{@model.address}}
        @primaryContact={{@model.contact}}
        @secondaryContact={{@model.secondaryContact}}
      />

      {{#if (or @model.minister.agentStartDate @model.minister.agentEndDate)}}
        <DataCard>
          <:title>Aanstelling</:title>
          <:card as |Card|>
            <Card.Columns>
              <:left as |Item|>
                <Item>
                  <:label>Startdatum</:label>
                  <:content>{{dateFormat
                      @model.minister.agentStartDate
                    }}</:content>
                </Item>
              </:left>
              <:right as |Item|>
                {{#if @model.minister.agentEndDate}}
                  <Item>
                    <:label>Einddatum</:label>
                    <:content>{{dateFormat
                        @model.minister.agentEndDate
                      }}</:content>
                  </Item>
                {{/if}}
              </:right>
            </Card.Columns>
          </:card>
        </DataCard>
      {{/if}}

      {{#if @model.minister.financing}}
        <DataCard>
          <:title>Financiering</:title>
          <:card as |Card|>
            <Card.Columns>
              <:left as |Item|>
                <Item>
                  <:label>FOD Justitie</:label>
                  <:content>{{receivesFinancing
                      @model.minister.financing.id
                    }}</:content>
                </Item>
              </:left>
            </Card.Columns>
          </:card>
        </DataCard>
      {{/if}}
    </div>
  </div>
</template>
