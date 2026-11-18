import PageHeader from '../../../../../components/page-header';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import SaveError from '../../../../../components/error/save';
import ReportWrongData from '../../../../../components/report-wrong-data';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import EditCard from '../../../../../components/edit-card';
import SiteTypeSelect from '../../../../../components/site-type-select';
import { fn } from '@ember/helper';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import ContactEditCard from '../../../../../components/site/contact-edit-card';
import or from 'ember-truth-helpers/helpers/or';
import not from 'ember-truth-helpers/helpers/not';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box au-o-flow au-o-flow--large">
      <PageHeader>
        <:title>Bewerk vestiging</:title>
        <:subtitle>
          {{@controller.model.address.fullAddress}},
          {{@controller.model.organization.abbName}}
        </:subtitle>
        <:action>
          <div class="au-u-text-right">
            <AuButtonGroup class="au-c-button-group--align-right">
              <AuLink
                @route="organizations.organization.sites.site"
                @skin="button-secondary"
              >
                Annuleer
              </AuLink>
              <AuButton
                @loading={{@controller.save.isRunning}}
                @loadingMessage="Opslaan"
                @disabled={{@controller.save.isRunning}}
                type="submit"
                form="edit-vestiging-form"
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
        id="edit-vestiging-form"
        aria-label="Edit site"
        {{on "submit" (perform @controller.save)}}
      >
        <div class="au-o-flow au-o-flow--large">
          <EditCard>
            <:title>Kerngegevens</:title>
            <:card as |Card|>
              <Card.Columns>
                <:left as |Item|>
                  <Item
                    @labelFor="site-type"
                    @required={{true}}
                    @errorMessage={{@controller.model.site.error.siteType.message}}
                  >
                    <:label>Type vestiging</:label>
                    <:content as |hasError|>
                      <SiteTypeSelect
                        @selected={{@controller.model.site.siteType}}
                        @onChange={{fn (mut @controller.model.site.siteType)}}
                        @organization={{@controller.model.organization}}
                        @id="site-type"
                        @error={{hasError}}
                      />
                    </:content>
                  </Item>
                  {{#if @controller.model.site.isOtherSite}}
                    <Item @labelFor="site-type-name">
                      <:label>Naam</:label>
                      <:content>
                        <AuInput
                          @selected={{@controller.model.site.siteTypeName}}
                          {{on "input" @controller.setSiteTypeName}}
                          value={{@controller.model.site.siteTypeName}}
                          @width="block"
                          maxlength="50"
                        />
                      </:content>
                    </Item>
                  {{/if}}
                </:left>
                <:right as |Item|>
                  <Item
                    @errorMessage={{@controller.isNoPrimarySiteErrorMessage}}
                  >
                    <:label>Primair correspondentieadres</:label>
                    <:content>
                      <AuRadioGroup
                        @alignment="inline"
                        @name="is-primary-site"
                        @selected={{@controller.isPrimarySite}}
                        @onChange={{@controller.updateIsPrimarySite}}
                        as |Group|
                      >
                        <Group.Radio @value={{true}}>Ja</Group.Radio>
                        <Group.Radio @value={{false}}>Nee</Group.Radio>
                      </AuRadioGroup>
                    </:content>
                  </Item>
                </:right>
              </Card.Columns>
            </:card>
          </EditCard>

          <ContactEditCard
            @address={{@controller.model.address}}
            @primaryContact={{@controller.model.contact}}
            @secondaryContact={{@controller.model.secondaryContact}}
            @isAddressSearchEnabledInitially={{if
              (or
                (not @controller.model.address.id)
                @controller.model.address.addressRegisterUri
              )
              true
              false
            }}
          >
            <:title>Contactgegevens</:title>
          </ContactEditCard>
        </div>
      </form>
    </div>
  </div>
</template>
