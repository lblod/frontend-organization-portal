import PageHeader from 'frontend-organization-portal/components/page-header';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import SaveError from 'frontend-organization-portal/components/error/save';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import RelatedOrganizationsEditTable from 'frontend-organization-portal/components/related-organizations-edit-table';
import ConfirmationModal from 'frontend-organization-portal/components/confirmation-modal';
import confirmationMessageText from 'frontend-organization-portal/helpers/confirmation-message-text';
import DeleteModal from 'frontend-organization-portal/components/delete-modal';
import AuModal from '@appuniversum/ember-appuniversum/components/au-modal';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box">
      <PageHeader class="au-u-margin-bottom-large">
        <:title>Bewerk gerelateerde organisaties</:title>
        <:subtitle>{{@model.organization.abbName}}
          ({{@model.organization.classification.label}})</:subtitle>
        <:action>
          <div class="au-u-text-right">
            <AuButtonGroup class="au-c-button-group--align-right">
              <AuLink
                @route="organizations.organization.related-organizations"
                @skin="button-secondary"
              >
                Annuleer
              </AuLink>
              <AuButton
                @loading={{@controller.save.isRunning}}
                @loadingMessage="Opslaan"
                @disabled={{@controller.save.isRunning}}
                form="edit-core-info-form"
                type="submit"
              >
                Opslaan
              </AuButton>
            </AuButtonGroup>
            <ReportWrongData />
            <SaveError @showSaveError={{@controller.hasValidationErrors}} />
          </div>
        </:action>
      </PageHeader>

      <form
        id="edit-core-info-form"
        aria-label="edit-core-info-form"
        {{on "submit" (perform @controller.save)}}
      >
        <div class="au-o-flow au-o-flow--large">
          <RelatedOrganizationsEditTable
            @model={{@model}}
            @content={{@controller.memberships}}
            @organizationStatus={{@controller.organizationStatus}}
            @page={{@controller.page}}
            @size={{@controller.size}}
            @addRelatedOrganization={{@controller.addMembership}}
            @removeRelatedOrganization={{@controller.removeMembership}}
            @updateMembershipRole={{@controller.updateMembershipRole}}
            @displayRoleLabel={{@controller.displayRoleLabel}}
            @selectedRole={{@controller.selectedRoleLabel}}
            @unsavedEdit={{@controller.hasUnsavedEdits}}
            @setOtherRelatedOrganization={{@controller.setRelatedOrganizationMembership}}
            @setStartDate={{@controller.setStartDate}}
            @setEndDate={{@controller.setEndDate}}
            @isDuplicateMembership={{@controller.isDuplicateMembership}}
            id="edit-related-organizations"
          />
        </div>
      </form>
    </div>
  </div>

  {{#if @controller.nonActiveRelatedOrganization}}
    <ConfirmationModal
      @message={{confirmationMessageText "nonActiveRelatedOrganization"}}
      @onConfirm={{@controller.confirmNonActiveRelatedOrganization}}
      @onCancel={{@controller.cancelNonActiveRelatedOrganization}}
    />
  {{/if}}

  {{#if @controller.founderToRemove}}
    <DeleteModal
      @title="Relatie verwijderen"
      @message="Een relatie verwijderen kan je niet ongedaan maken. Wens je zeker door te gaan met het verwijderen van de relatie? Na het opslaan van de pagina wordt de relatie pas definitief verwijderd."
      @deleteLabel="Relatie verwijderen"
      @onConfirm={{@controller.reallyRemoveMembership}}
      @onCancel={{@controller.cancelMembershipRemoval}}
    />
  {{/if}}

  {{#if @controller.membershipRemovalError}}
    <AuModal
      @modalOpen={{true}}
      @closeModal={{@controller.dismissMembershipRemovalError}}
    >
      <:title>Relatie verwijderen</:title>
      <:body>{{@controller.membershipRemovalError}}</:body>
      <:footer>
        <AuButton
          {{on "click" @controller.dismissMembershipRemovalError}}
        >OK</AuButton>
      </:footer>
    </AuModal>
  {{/if}}
</template>
