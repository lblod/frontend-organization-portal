import pageTitle from 'ember-page-title/helpers/page-title';
import PageHeader from 'frontend-organization-portal/components/page-header';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import SaveError from 'frontend-organization-portal/components/error/save';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import OrganizationSelect from 'frontend-organization-portal/components/organization-select';
import { fn } from '@ember/helper';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import PowerSelect from 'ember-power-select/components/power-select';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import ConfirmationModal from 'frontend-organization-portal/components/confirmation-modal';
import confirmationMessageText from 'frontend-organization-portal/helpers/confirmation-message-text';

<template>
  {{pageTitle "Bewerk"}}
  <div class="au-c-body-container au-c-body-container--scroll">
    <PageHeader class="au-o-box">
      <:title>Bewerk betrokken lokale besturen</:title>
      <:subtitle>{{@model.organization.abbName}}</:subtitle>
      <:action>
        <div class="au-u-text-right">
          <AuButtonGroup class="au-c-button-group--align-right">
            <AuLink
              @route="organizations.organization.local-involvements"
              @skin="button-secondary"
            >
              Annuleer
            </AuLink>
            <AuButton
              @loading={{@controller.save.isRunning}}
              @loadingMessage="Opslaan"
              @disabled={{@controller.save.isRunning}}
              form="local-involvements-edit-creation"
              type="submit"
            >
              Opslaan
            </AuButton>
          </AuButtonGroup>
          <SaveError @showSaveError={{@controller.hasValidationErrors}} />
          <ReportWrongData />
        </div>
      </:action>
    </PageHeader>

    <form
      id="local-involvements-edit-creation"
      {{on "submit" (perform @controller.save)}}
    >
      <AuDataTable
        @content={{@model.involvements}}
        @noDataMessage="Geen betrokken lokale besturen"
        as |t|
      >
        <t.content as |c|>
          <c.header>
            <th
              id="organization"
              style="min-width: 18rem;"
              {{!TODO: replace this with some width utilities}}
              {{! template-lint-disable no-inline-styles }}
            >Naam</th>
            <th id="classification">Type instelling</th>
            <th id="involvement-type">Type betrokkenheid</th>
            {{#if @model.organization.isWorshipService}}
              <th id="financial-percentage">
                Financieel percentage
                <AuHelpText @skin="tertiary" class="au-u-margin-top-none">
                  Het totaal van alle percentages moet gelijk zijn aan 100
                </AuHelpText>
              </th>
              {{! Make sure this column has a minimum width so the columns don't shift when the button is shown }}
              <th
                style="min-width: 18rem;"
                {{! template-lint-disable no-inline-styles }}
              ></th>
            {{/if}}
          </c.header>
          <c.body as |involvement|>
            <td>
              {{#let
                involvement.error.administrativeUnit.message
                as |errorMessage|
              }}
                <OrganizationSelect
                  @selected={{involvement.administrativeUnit}}
                  @onChange={{fn
                    @controller.setInvolvedOrganization
                    involvement
                  }}
                  @allowClear={{involvement.isNew}}
                  @ariaLabelledBy="organization"
                  @error={{errorMessage}}
                  @classificationCodes={{involvement.worshipAdministrativeUnit.localInvolvementClassifications}}
                  as |organization|
                >
                  {{organization.abbName}}
                  ({{organization.classification.label}})
                </OrganizationSelect>

                {{#if errorMessage}}
                  <AuHelpText @error={{true}}>{{errorMessage}}</AuHelpText>
                {{/if}}
              {{/let}}
            </td>
            <td>
              <AuInput
                @width="block"
                @disabled={{true}}
                value={{involvement.administrativeUnit.classification.label}}
                aria-labelledby="classification"
              />
            </td>
            <td>
              {{#let
                involvement.error.involvementType.message
                as |errorMessage|
              }}
                <div class={{if errorMessage "ember-power-select--error"}}>
                  {{#if @model.organization.isWorshipService}}
                    <PowerSelect
                      @noMatchesMessage="Geen resultaten"
                      @options={{if
                        involvement.administrativeUnit.isProvince
                        @controller.model.involvementTypesProvince
                        @controller.model.involvementTypes
                      }}
                      @selected={{involvement.involvementType}}
                      @onChange={{fn
                        @controller.handleInvolvementTypeSelection
                        involvement
                      }}
                      @ariaLabelledBy="involvement-type"
                      @allowClear={{involvement.isNew}}
                      as |involvementType|
                    >
                      {{involvementType.label}}
                    </PowerSelect>
                  {{else}}
                    <AuInput
                      @width="block"
                      @disabled={{true}}
                      value={{involvement.involvementType.label}}
                      aria-labelledby="involvement-type"
                    />
                  {{/if}}
                </div>
                {{#if errorMessage}}
                  <AuHelpText @error={{true}}>{{errorMessage}}</AuHelpText>
                {{/if}}
              {{/let}}
            </td>
            {{#if @model.organization.isWorshipService}}
              <td>
                {{#let
                  (@controller.isDisabledPercentage involvement)
                  as |isDisabledPercentage|
                }}
                  {{#let
                    (and
                      (not isDisabledPercentage)
                      (or
                        involvement.error.percentage.message
                        @model.organization.error.involvements.message
                      )
                    )
                    as |errorMessage|
                  }}
                    <AuInput
                      @disabled={{isDisabledPercentage}}
                      @error={{errorMessage}}
                      type="number"
                      step="any"
                      aria-labelledby="financial-percentage"
                      value={{involvement.percentage}}
                      {{on
                        "input"
                        (fn @controller.handlePercentageChange involvement)
                      }}
                    />
                    {{#if errorMessage}}
                      <AuHelpText @error={{true}}>{{errorMessage}}</AuHelpText>
                    {{/if}}
                  {{/let}}
                {{/let}}
              </td>
              <td class="align-middle">
                {{#if
                  (and
                    involvement.isNew
                    (not involvement.administrativeUnit.id)
                    (not involvement.involvementType.id)
                    (eq involvement.percentage 0)
                  )
                }}
                  <AuButton
                    @alert={{true}}
                    @icon="bin"
                    @iconAlignment="left"
                    @skin="link"
                    {{on
                      "click"
                      (fn @controller.deleteUnsavedLocalInvolvement involvement)
                    }}
                  >Verwijder</AuButton>
                {{/if}}
              </td>
            {{/if}}
          </c.body>
        </t.content>
      </AuDataTable>
    </form>

    {{#if @model.organization.isWorshipService}}
      <div class="au-o-box au-o-box--small">
        <AuButton
          @skin="secondary"
          @width="block"
          @icon="add"
          @iconAlignment="left"
          {{on "click" @controller.addNewLocalInvolvement}}
        >
          Voeg nieuw betrokken lokaal bestuur toe
        </AuButton>
      </div>
    {{/if}}
  </div>

  {{#if @controller.hasNonActiveInvolvement}}
    <ConfirmationModal
      @message={{confirmationMessageText "nonActiveRelatedOrganization"}}
      @onConfirm={{@controller.confirmSetInvolvedOrganization}}
      @onCancel={{@controller.cancelSetInvolvedOrganization}}
    />
  {{/if}}
</template>
