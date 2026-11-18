import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import paramsFor from '../../../../helpers/params-for';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import PageHeader from '../../../../components/page-header';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import SaveError from '../../../../components/error/save';
import EditCard from '../../../../components/edit-card';
import ChangeEventTypeSelect from '../../../../components/change-event-type-select';
import AuTextarea from '@appuniversum/ember-appuniversum/components/au-textarea';
import eventValue from '../../../../helpers/event-value';
import { fn } from '@ember/helper';
import TrimInput from '../../../../components/trim-input';
import LegalFormSelect from '../../../../components/legal-form-select';
import LocationMultipleSelect from '../../../../components/location-multiple-select';
import isAdditionalQualificationChangeEvent from '../../../../helpers/is-additional-qualification-change-event';
import AdditionalQualificationsList from '../../../../components/additional-qualifications-list';
import AdditionalQualificationsSelect from '../../../../components/additional-qualifications-select';
import DecisionDocumentLinks from '../../../../components/change-events/decision-document-links';
import and from 'ember-truth-helpers/helpers/and';
import Datepicker from '../../../../components/datepicker';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import OrganizationSelect from '../../../../components/organization-select';
import gt from 'ember-truth-helpers/helpers/gt';
import not from 'ember-truth-helpers/helpers/not';
import lt from 'ember-truth-helpers/helpers/lt';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import PowerSelect from 'ember-power-select/components/power-select';
import hasManyValue from '../../../../helpers/has-many-value';

<template>
  {{pageTitle "Nieuwe veranderingsgebeurtenis"}}
  {{breadcrumb
    "Nieuwe veranderingsgebeurtenis"
    route="organizations.organization.change-events.new"
    model=(paramsFor "organizations.organization" param="id")
  }}

  <div class="au-c-body-container au-c-body-container--scroll">
    <form
      class="au-o-box au-o-flow au-o-flow--large"
      {{on "submit" (perform @controller.createNewChangeEventTask)}}
    >
      <PageHeader>
        <:title>Voeg veranderingsgebeurtenis toe</:title>
        <:subtitle>{{@model.organization.abbName}}
          ({{@model.organization.classification.label}})</:subtitle>
        <:action>
          <div class="au-u-text-right">
            <AuButtonGroup class="au-c-button-group--align-right">
              <AuLink
                @route="organizations.organization.change-events"
                @skin="button-secondary"
              >
                Annuleer
              </AuLink>
              <AuButton
                @loading={{@controller.createNewChangeEventTask.isRunning}}
                @loadingMessage="Opslaan"
                @disabled={{@controller.createNewChangeEventTask.isRunning}}
                type="submit"
              >
                Opslaan
              </AuButton>
            </AuButtonGroup>
            <SaveError @showSaveError={{@controller.hasValidationErrors}} />
          </div>
        </:action>
      </PageHeader>

      <EditCard @containsRequiredFields={{true}}>
        <:title>Veranderingsgebeurtenis</:title>
        <:card as |Card|>
          <Card.Columns>
            <:left as |Item|>
              <Item
                @labelFor="change-event-type"
                @required={{true}}
                @errorMessage={{@model.changeEvent.error.type.message}}
              >
                <:label>Type veranderingsgebeurtenis</:label>
                <:content as |hasError|>
                  <ChangeEventTypeSelect
                    @id="change-event-type"
                    @selected={{@model.changeEvent.type}}
                    @organizationClassification={{@model.organization.classification}}
                    @onChange={{@controller.updateChangeEventType}}
                    @error={{hasError}}
                  />
                </:content>
              </Item>
              <Item @labelFor="change-event-description">
                <:label>Beschrijving</:label>
                <:content>
                  <AuTextarea
                    @width="block"
                    value={{@model.changeEvent.description}}
                    id="change-event-description"
                    {{on
                      "input"
                      (eventValue (fn (mut @model.changeEvent.description)))
                    }}
                  />
                </:content>
              </Item>
              {{#if (@controller.isNameChangeType @model.changeEvent.type)}}
                <Item>
                  <:label>Huidige naam</:label>
                  <:content>
                    {{@model.organization.abbName}}
                  </:content>
                </Item>
                <Item
                  @labelFor="change-event-resulting-name"
                  @required={{true}}
                  @errorMessage={{@model.changeEvent.error.resultingName.message}}
                >
                  <:label>Nieuwe naam</:label>
                  <:content as |hasError|>
                    <TrimInput
                      @value={{@controller.resultingName}}
                      @onUpdate={{fn (mut @controller.resultingName)}}
                      @width="block"
                      @error={{hasError}}
                      id="change-event-resulting-name"
                    />
                  </:content>
                </Item>
              {{/if}}
              {{#if @controller.isLegalFormChange}}
                {{! The current legal form may not be available, so we hide the field in that scenario }}
                {{#if @model.organization.legalForm}}
                  <Item>
                    <:label>Huidige juridische vorm</:label>
                    <:content>
                      {{@model.organization.legalForm.label}}
                    </:content>
                  </Item>
                {{/if}}
                <Item
                  @labelFor="change-event-legal-form"
                  @required={{true}}
                  @errorMessage={{@model.changeEvent.error.resultingLegalForm.message}}
                >
                  <:label>Nieuwe juridische vorm</:label>
                  <:content as |hasError|>
                    <LegalFormSelect
                      @id="change-event-legal-form"
                      @selected={{@controller.selectedResultingLegalForm}}
                      @onChange={{@controller.updateResultingLegalForm}}
                      @error={{hasError}}
                    />
                  </:content>
                </Item>
              {{/if}}
              {{#if @model.changeEvent.isWerkingsgebiedChangeEvent}}
                {{! The current scope may not be available, so we hide the field in that scenario }}
                {{#if @model.currentScopeLabel}}
                  <Item>
                    <:label>Huidig werkingsgebied</:label>
                    <:content>
                      {{@model.currentScopeLabel}}
                    </:content>
                  </Item>
                {{/if}}
                <Item
                  @labelFor="change-event-scope"
                  @required={{true}}
                  @errorMessage={{@model.changeEvent.error.resultingScope.message}}
                >
                  <:label>Nieuw werkingsgebied</:label>
                  <:content as |hasError|>
                    <LocationMultipleSelect
                      @id="change-event-scope"
                      @selected={{@controller.selectedResultingLocations}}
                      @onChange={{@controller.updateResultingLocations}}
                      @error={{hasError}}
                    />
                  </:content>
                </Item>
              {{/if}}
              {{#if (isAdditionalQualificationChangeEvent @model.changeEvent)}}
                {{! The current qualifications may not be available, so we hide the field in that scenario }}
                {{#if @model.organization.additionalQualifications.length}}
                  <Item>
                    <:label>Huidige bijkomende kwalificatie(s)</:label>
                    <:content>
                      <AdditionalQualificationsList
                        @qualifications={{@model.organization.additionalQualifications}}
                      />
                    </:content>
                  </Item>
                {{/if}}
                <Item
                  @labelFor="change-event-additional-qualifications"
                  @required={{true}}
                  @errorMessage={{@model.changeEvent.error.resultingAdditionalQualifications.message}}
                >
                  <:label>Nieuwe bijkomende kwalificatie(s)</:label>
                  <:content as |hasError|>
                    <AdditionalQualificationsSelect
                      @id="change-event-additional-qualifications"
                      @selected={{@controller.selectedResultingAdditionalQualifications}}
                      @onChange={{@controller.updateResultingAdditionalQualifications}}
                      @error={{hasError}}
                    />
                  </:content>
                </Item>
              {{/if}}
              {{#if @model.changeEvent.requiresDecisionInformation}}
                <Item
                  @errorMessage={{@model.decision.error.documentLinks}}
                  @labelFor="change-event-decision-link-0"
                >
                  <:label>Links naar besluiten</:label>
                  <:content>
                    <DecisionDocumentLinks
                      @decision={{@model.decision}}
                      @errors={{@model.decision.error.documentLinks}}
                    />
                  </:content>
                  <:error>
                    {{!
                    If we do not add the error block, the default implementation is used.
                    Since we display the error below each field, we do not want the default implementation.
                  }}
                  </:error>
                </Item>
              {{/if}}
            </:left>
            <:right as |Item|>
              {{#if
                (and
                  @model.organization.isWorshipAdministrativeUnit
                  @model.changeEvent.requiresDecisionInformation
                )
              }}
                <Item
                  @labelFor="change-event-decision-activity-date"
                  @errorMessage={{@model.decisionActivity.error.endDate.message}}
                >
                  <:label>Datum ministerieel besluit</:label>
                  <:content as |hasError|>
                    <Datepicker
                      @error={{hasError}}
                      @id="change-event-decision-activity-date"
                      @value={{@model.decisionActivity.endDate}}
                      @onChange={{fn (mut @model.decisionActivity.endDate)}}
                    />
                  </:content>
                </Item>
              {{/if}}
              {{#if
                (and
                  @model.changeEvent.requiresDecisionInformation
                  (or
                    @model.organization.isWorshipAdministrativeUnit
                    (and
                      (@controller.isNameChangeType @model.changeEvent.type)
                      (or
                        @model.organization.isMunicipality
                        @model.organization.isProvince
                      )
                    )
                    (and
                      @model.changeEvent.isCityChangeEvent
                      @model.organization.isMunicipality
                    )
                  )
                )
              }}
                <Item
                  @labelFor="change-event-decision-publication-date"
                  @errorMessage={{@model.decision.error.publicationDate.message}}
                >
                  <:label>
                    {{#if @model.organization.isWorshipAdministrativeUnit}}
                      Datum publicatie BS
                    {{else}}
                      Datum besluit
                    {{/if}}
                  </:label>
                  <:content as |hasError|>
                    <Datepicker
                      @error={{hasError}}
                      @id="change-event-decision-publication-date"
                      @value={{@model.decision.publicationDate}}
                      @onChange={{fn (mut @model.decision.publicationDate)}}
                    />
                  </:content>
                </Item>
              {{/if}}
              <Item
                @labelFor="change-event-date"
                @required={{true}}
                @errorMessage={{@model.changeEvent.error.date.message}}
              >
                <:label>Datum veranderingsgebeurtenis</:label>
                <:content as |hasError|>
                  <Datepicker
                    @id="change-event-date"
                    @value={{@model.changeEvent.date}}
                    @onChange={{fn (mut @model.changeEvent.date)}}
                    @error={{hasError}}
                  />
                </:content>
              </Item>
            </:right>
          </Card.Columns>
        </:card>
      </EditCard>

      {{#if @model.changeEvent.canAffectMultipleOrganizations}}
        <EditCard>
          <:title>{{@model.changeEvent.type.label}}</:title>
          <:card as |Card|>
            <Card.Columns>
              <:left as |Item|>
                {{#each
                  @model.changeEvent.originalOrganizations
                  as |organization|
                }}
                  <Item @required={{eq @model.organization organization}}>
                    <:label>Betrokken organisatie</:label>
                    <:content>
                      <div class="flex items-center">
                        <OrganizationSelect
                          @disabled={{eq
                            @controller.model.organization
                            organization
                          }}
                          @selected={{organization}}
                          @onChange={{fn
                            @controller.updateOriginalOrganizations
                            organization
                          }}
                          @classificationCodes={{@controller.classificationCodes}}
                          @filter={{@controller.filterSelectedOriginalOrganizations}}
                          @showKbo={{true}}
                          class="grow"
                        />
                        {{#if
                          (and
                            (gt
                              @model.changeEvent.originalOrganizations.length 1
                            )
                            (not
                              (eq @controller.model.organization organization)
                            )
                          )
                        }}
                          <AuButton
                            @alert={{true}}
                            @skin="link"
                            @icon="bin"
                            @hideText={{true}}
                            @size="large"
                            class="shrink-0"
                            type="button"
                            {{on
                              "click"
                              (fn
                                @controller.removeOriginalOrganization
                                organization
                              )
                            }}
                          >
                            Verwijder
                          </AuButton>
                        {{/if}}
                      </div>
                    </:content>
                  </Item>
                {{/each}}

                {{#if
                  (or
                    @controller.isAddingOriginalOrganizations
                    (lt @model.changeEvent.originalOrganizations.length 2)
                  )
                }}
                  <Item
                    @required={{and
                      @model.changeEvent.isMergerChangeEvent
                      (lt @model.changeEvent.originalOrganizations.length 2)
                    }}
                    @errorMessage={{@model.changeEvent.error.originalOrganizations.message}}
                  >
                    <:label>Betrokken organisatie</:label>
                    <:content as |hasError|>
                      <div class="flex items-center">
                        <OrganizationSelect
                          @onChange={{@controller.updateOriginalOrganizations}}
                          @classificationCodes={{@controller.classificationCodes}}
                          @filter={{@controller.filterSelectedOriginalOrganizations}}
                          @error={{hasError}}
                          @showKbo={{true}}
                          class="grow"
                        />
                        {{#if
                          (gt @model.changeEvent.originalOrganizations.length 1)
                        }}
                          <AuButton
                            @alert={{true}}
                            @skin="link"
                            @icon="bin"
                            @hideText={{true}}
                            @size="large"
                            class="shrink-0"
                            {{on
                              "click"
                              (fn
                                (mut @controller.isAddingOriginalOrganizations)
                                false
                              )
                            }}
                          >
                            Verwijder
                          </AuButton>
                        {{/if}}
                      </div>
                    </:content>
                  </Item>
                {{else}}
                  <Item>
                    <:content>
                      <AuButton
                        @skin="link"
                        {{on
                          "click"
                          (fn
                            (mut @controller.isAddingOriginalOrganizations) true
                          )
                        }}
                      >
                        Voeg bijkomende organisatie toe
                      </AuButton>
                    </:content>
                  </Item>
                {{/if}}
              </:left>

              <:right as |Item|>
                {{#if @model.changeEvent.isMergerChangeEvent}}
                  <Item
                    @required={{true}}
                    @errorMessage={{@model.changeEvent.error.resultingOrganizations.message}}
                  >
                    <:label>Resulterende organisatie</:label>
                    <:content as |hasError|>
                      {{#if @model.organization.isCentralWorshipService}}
                        <OrganizationSelect
                          @selected={{@controller.selectedResultingOrganization}}
                          @onChange={{@controller.updateResultingOrganizations}}
                          @classificationCodes={{@controller.classificationCodes}}
                          @filter={{@controller.filterSelectedOriginalOrganizations}}
                          @error={{hasError}}
                          @showKbo={{true}}
                        />
                        <div class="au-u-margin-top-tiny">
                          <AuLinkExternal
                            href={{@controller.organizationCreationUrl}}
                          >
                            Maak resulterende organisatie aan
                          </AuLinkExternal>
                          indien deze nog niet bestaat.
                        </div>
                      {{else}}
                        <div class={{if hasError "ember-power-select--error"}}>
                          <PowerSelect
                            @options={{hasManyValue
                              @model.changeEvent
                              "originalOrganizations"
                            }}
                            @selected={{@controller.selectedResultingOrganization}}
                            @onChange={{@controller.updateResultingOrganizations}}
                            as |organization|
                          >
                            {{#if organization.kboNumber}}
                              {{organization.kboNumber}}
                              -
                              {{organization.abbName}}
                            {{else}}
                              {{organization.abbName}}
                              (geen kbo gevonden)
                            {{/if}}
                          </PowerSelect>
                        </div>
                      {{/if}}
                    </:content>
                  </Item>
                {{/if}}
              </:right>
            </Card.Columns>
          </:card>
        </EditCard>
      {{/if}}
    </form>
  </div>
</template>
