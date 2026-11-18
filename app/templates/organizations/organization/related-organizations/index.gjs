import PageHeader from 'frontend-organization-portal/components/page-header';
import not from 'ember-truth-helpers/helpers/not';
import or from 'ember-truth-helpers/helpers/or';
import readOnly from 'frontend-organization-portal/helpers/read-only';
import EditsDisabledMessage from 'frontend-organization-portal/components/edits-disabled-message';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import SecuredArea from 'frontend-organization-portal/components/secured-area';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import { LinkTo } from '@ember/routing';
import RelatedOrganizationsViewTable from 'frontend-organization-portal/components/related-organizations-view-table';
import { fn } from '@ember/helper';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box au-o-flow au-o-flow--large">
      <PageHeader class="au-o-box">
        <:title>Gerelateerde organisaties</:title>
        <:subtitle>{{@model.organization.abbName}}
          ({{@model.organization.classification.label}})
        </:subtitle>
        <:action>
          <div class="au-u-text-right">
            {{#if
              (not
                (or
                  @model.organization.isDistrict
                  @model.organization.isProvince
                  @model.organization.isRepresentativeBody
                  @model.organization.isAndere
                )
              )
            }}
              {{#if (readOnly)}}
                <EditsDisabledMessage />
                <ReportWrongData />
              {{else}}
                <SecuredArea>
                  <:edit>
                    <AuLink
                      @route="organizations.organization.related-organizations.edit"
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
            {{/if}}
          </div>
        </:action>
      </PageHeader>

      <p>
        Dit register bevat enkel organisaties die in regelgeving als
        afzonderlijke organisatietypes worden omschreven. Dit register brengt
        uitsluitend de onderlinge relaties tussen deze opgenomen
        organisatietypes in kaart.
      </p>

      {{#if @model.organization.isWorshipAdministrativeUnit}}
        <div>
          Om de gerelateerde gemeenten te zien, ga naar
          <LinkTo
            class="au-c-link"
            @model={{@model.organization.id}}
            @route="organizations.organization.local-involvements.index"
          >
            Betrokken lokale besturen
          </LinkTo>
        </div>
      {{/if}}

      <div>
        <RelatedOrganizationsViewTable
          @model={{@model}}
          id="relatedOrganizations"
          @organizationStatus={{@controller.organizationStatus}}
          @onOrganizationStatusChange={{fn
            (mut @controller.organizationStatus)
          }}
          @sort={{@controller.sort}}
          @page={{@controller.page}}
          @size={{@controller.size}}
          @selectedRole={{@controller.selectedRoleLabel}}
        />
      </div>
    </div>
  </div>
</template>
