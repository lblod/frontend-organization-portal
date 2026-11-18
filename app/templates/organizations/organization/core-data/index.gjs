import PageHeader from 'frontend-organization-portal/components/page-header';
import readOnly from 'frontend-organization-portal/helpers/read-only';
import EditsDisabledMessage from 'frontend-organization-portal/components/edits-disabled-message';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import SecuredArea from 'frontend-organization-portal/components/secured-area';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import dateFormat from 'frontend-organization-portal/helpers/date-format';
import AuTabs from '@appuniversum/ember-appuniversum/components/au-tabs';
import { on } from '@ember/modifier';
import { fn, get } from '@ember/helper';
import DataCard from 'frontend-organization-portal/components/data-card';
import gt from 'ember-truth-helpers/helpers/gt';
import joinArray from 'frontend-organization-portal/helpers/join-array';
import requiresAdditionalQualifications from 'frontend-organization-portal/helpers/requires-additional-qualifications';
import AdditionalQualificationsList from 'frontend-organization-portal/components/additional-qualifications-list';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import and from 'ember-truth-helpers/helpers/and';
import or from 'ember-truth-helpers/helpers/or';
import RichTextEditor from 'frontend-organization-portal/components/rich-text-editor';
import OrganizationStatus from 'frontend-organization-portal/components/organization-status';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import kboFormat from 'frontend-organization-portal/helpers/kbo-format';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import ContactDataCard from 'frontend-organization-portal/components/site/contact-data-card';
import KboDataCard from 'frontend-organization-portal/components/kbo-organization/data-card';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box au-o-flow au-o-flow--large">
      <PageHeader>
        <:title>Kerngegevens</:title>
        <:subtitle>{{@model.organization.abbName}}
          ({{@model.organization.classification.label}})
        </:subtitle>
        <:action>
          {{#if @controller.showAbbData}}
            {{#unless @model.organization.isRepresentativeBody}}
              {{#if (readOnly)}}
                <div class="au-u-text-right">
                  <EditsDisabledMessage />
                  <ReportWrongData />
                </div>
              {{else}}
                <SecuredArea>
                  <:edit>
                    <div class="au-u-text-right">
                      <AuLink
                        @route="organizations.organization.core-data.edit"
                        @skin="button-secondary"
                        @icon="pencil"
                        @iconAlignment="left"
                      >
                        Bewerk
                      </AuLink>
                      <ReportWrongData />
                    </div>
                  </:edit>
                </SecuredArea>
              {{/if}}
            {{/unless}}
          {{else if @model.kboOrganization.modified}}
            <div class="au-u-text-right">
              <AuPill @icon="clock-rewind">
                Laatst Gewijzigd op
                {{dateFormat @model.kboOrganization.modified}}
              </AuPill>
              <ReportWrongData />
            </div>
          {{/if}}
        </:action>
      </PageHeader>

      <AuTabs as |Tab|>
        <Tab>
          <AuLink
            @width="block"
            class={{if
              @controller.showAbbData
              "active tab-link-align-left"
              "tab-link-align-left"
            }}
            {{on "click" (fn @controller.setShowAbbData true)}}
          >ABB Gegevens</AuLink>
        </Tab>

        <Tab>
          <AuLink
            @width="block"
            class={{if
              @controller.showAbbData
              "tab-link-align-left"
              "active tab-link-align-left"
            }}
            {{on "click" (fn @controller.setShowAbbData false)}}
          >KBO Gegevens</AuLink>
        </Tab>
      </AuTabs>

      {{#if @controller.showAbbData}}
        <DataCard>
          <:title>Organisatie</:title>
          <:card as |Card|>
            <Card.Columns>
              <:left as |Item|>
                <Item>
                  <:label>Naam</:label>
                  <:content>{{@model.organization.abbName}}</:content>
                </Item>
                <Item>
                  <:label>Juridische naam</:label>
                  <:content>{{@model.organization.legalName}}</:content>
                </Item>
                {{#if (gt @model.organization.alternativeName.length 0)}}
                  <Item>
                    <:label>Alternatieve naam</:label>
                    <:content>
                      {{joinArray @model.organization.alternativeName}}
                    </:content>
                  </Item>
                {{/if}}
                {{#unless @model.organization.isRepresentativeBody}}
                  <Item>
                    <:label>Type bestuur</:label>
                    <:content>
                      {{@model.organization.classification.label}}
                    </:content>
                  </Item>
                  {{#unless @model.organization.isWorshipAdministrativeUnit}}
                    <Item>
                      <:label>Juridische vorm</:label>
                      <:content>
                        {{@model.organization.legalForm.label}}
                      </:content>
                    </Item>
                  {{/unless}}
                  {{#if @model.organization.requiresContentThemes}}
                    <Item>
                      <:label>Inhoudelijk thema</:label>
                      <:content>
                        {{@controller.contentThemesString}}
                      </:content>
                    </Item>
                  {{/if}}
                {{/unless}}

                {{#if
                  (requiresAdditionalQualifications
                    @model.organization.classification
                  )
                }}
                  <Item>
                    <:label>Bijkomende kwalificatie(s)</:label>
                    <:content>
                      <AdditionalQualificationsList
                        @qualifications={{@model.organization.additionalQualifications}}
                      />
                    </:content>
                  </Item>
                  <Item>
                    <:label>Rechtsgrond</:label>
                    <:content>
                      <AuList @divider={{true}} as |Item|>
                        {{#each
                          @model.organization.additionalQualifications
                          as |qualification|
                        }}
                          <Item>
                            {{qualification.legalBasis}}
                          </Item>
                        {{/each}}
                      </AuList>
                    </:content>
                  </Item>
                {{/if}}

                {{#if @model.organization.isMunicipality}}
                  <Item>
                    <:label>Stadstitel</:label>
                    <:content>
                      {{#if @model.isCity}}
                        Ja
                      {{else}}
                        Nee
                      {{/if}}
                    </:content>
                  </Item>
                {{/if}}

                {{#if @model.organization.recognizedWorshipType}}
                  <Item>
                    <:label>Soort eredienst</:label>
                    <:content
                    >{{@model.organization.recognizedWorshipType.label}}</:content>
                  </Item>
                {{/if}}
                {{#if @model.organization.denomination}}
                  <Item>
                    <:label>Strekking</:label>
                    <:content>{{@model.organization.denomination}}</:content>
                  </Item>
                {{/if}}
                {{#if @model.organization.isWorshipService}}
                  <Item>
                    <:label>Grensoverschrijdend</:label>
                    <:content>
                      {{@model.organization.crossBorderNominal}}
                    </:content>
                  </Item>
                {{/if}}
                {{#if
                  (and @model.organization.displayRegion @model.regions.length)
                }}
                  <Item>
                    <:label>Regio</:label>
                    <:content>
                      {{#each @model.regions as |region index|}}{{if
                          index
                          ", "
                        }}{{region.label}}{{/each}}
                    </:content>
                  </Item>
                {{/if}}
                {{#if
                  (or
                    @model.organization.isAdministrativeUnit
                    @model.organization.isZorgraad
                    @model.organization.isRegionaalZorgplatform
                    @model.organization.isRegionaalLandschap
                    @model.organization.isBosgroep
                    @model.organization.isWoonmaatschappij
                    @model.organization.isPrivateOcmwAssociation
                  )
                }}
                  <Item>
                    <:label>Werkingsgebied</:label>
                    <:content>{{@model.scopeLabel}}</:content>
                  </Item>
                {{/if}}
                {{#if
                  (or
                    @model.organization.isIgs
                    @model.organization.isOcmwAssociation
                    @model.organization.isPevaMunicipality
                    @model.organization.isPevaProvince
                  )
                }}
                  {{#if @model.organization.expectedEndDate}}
                    <Item>
                      <:label>Geplande einddatum</:label>
                      <:content>
                        {{dateFormat @model.organization.expectedEndDate}}
                        {{#if @controller.expiredExpectedEndDate}}
                          <AuPill @skin="error">De geplande einddatum is
                            overschreden</AuPill>
                        {{/if}}
                      </:content>
                    </Item>
                  {{/if}}
                  {{#if @model.organization.purpose}}
                    <Item>
                      <:label>Doel</:label>
                      <:content>
                        <RichTextEditor
                          @show="true"
                          @value={{@model.organization.purpose}}
                        />
                      </:content>
                    </Item>
                  {{/if}}
                {{/if}}
              </:left>
              <:right as |Item|>
                <Item>
                  <:label>Status</:label>
                  <:content>
                    <OrganizationStatus
                      @id={{@model.organization.organizationStatus.id}}
                      @label={{@model.organization.organizationStatus.label}}
                    />
                  </:content>
                </Item>
                {{#if @model.resultedFrom}}
                  <Item>
                    <:content>
                      <AuHelpText @skin="tertiary" class="au-u-margin-top-none">
                        Gewijzigd op
                        {{dateFormat (get @model.resultedFrom "0.date")}}
                      </AuHelpText>
                    </:content>
                  </Item>
                {{/if}}
                {{#if @controller.kboIdentifier.structuredIdentifier.localId}}
                  <Item>
                    <:label>{{@controller.kboIdentifier.idName}}</:label>
                    <:content>
                      {{kboFormat
                        @controller.kboIdentifier.structuredIdentifier.localId
                      }}
                    </:content>
                  </Item>
                {{/if}}
                {{#if
                  @controller.sharepointIdentifier.structuredIdentifier.localId
                }}
                  <Item>
                    <:label>{{@controller.sharepointIdentifier.idName}}</:label>
                    <:content>
                      <AuLinkExternal
                        href="{{@controller.sharePointLinkBase}}{{@controller.sharepointIdentifier.structuredIdentifier.localId}}"
                      >
                        {{@controller.sharepointIdentifier.structuredIdentifier.localId}}
                        (externe link)
                      </AuLinkExternal>
                    </:content>
                  </Item>
                {{/if}}
                {{#if
                  (and
                    @model.organization.scope.exactMatch
                    (or
                      @model.organization.isMunicipality
                      @model.organization.isProvince
                    )
                  )
                }}
                  <Item>
                    <:label>NIS</:label>
                    <:content>
                      {{@model.organization.scope.exactMatch.notation}}
                    </:content>
                  </Item>
                {{/if}}
                {{#if @controller.ovoIdentifier.structuredIdentifier.localId}}
                  <Item>
                    <:label>{{@controller.ovoIdentifier.idName}}</:label>
                    <:content>
                      {{@controller.ovoIdentifier.structuredIdentifier.localId}}
                    </:content>
                  </Item>
                {{/if}}
                <Item>
                  <:label>Digitaal platform</:label>
                  <:content>
                    {{@controller.vendorsString}}
                  </:content>
                </Item>
              </:right>
            </Card.Columns>
          </:card>
        </DataCard>

        <ContactDataCard
          @address={{@model.organization.primarySite.address}}
          @primaryContact={{@model.primaryContact}}
          @secondaryContact={{@model.secondaryContact}}
        >
          <:title>
            Primaire contactgegevens
          </:title>
        </ContactDataCard>
      {{else}}
        <KboDataCard
          @kboOrganization={{@model.kboOrganization}}
          @kboNumber={{@controller.kboIdentifier.structuredIdentifier.localId}}
          @kboContact={{@model.kboContact}}
        />
      {{/if}}
    </div>
  </div>
</template>
