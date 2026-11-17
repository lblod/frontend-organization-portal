import PageHeader from '../../../../components/page-header';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import Save from '../../../../components/error/save';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import EditCard from '../../../../components/edit-card';
import SiteTypeSelect from '../../../../components/site-type-select';
import { fn } from '@ember/helper';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import ContactEditCard from '../../../../components/site/contact-edit-card';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box au-o-flow au-o-flow--large">
      <PageHeader>
        <:title>Voeg vestiging toe</:title>
        <:action>
          <div class="au-u-test-right">
            <AuButtonGroup class="au-c-button-group--align-right">
              <AuLink
                @route="organizations.organization.sites"
                @skin="button-secondary"
              >
                Annuleer
              </AuLink>
              <AuButton
                @loading={{@controller.createSiteTask.isRunning}}
                @loadingMessage="Voeg toe"
                @disabled={{@controller.createSiteTask.isRunning}}
                @icon="add"
                @iconAlignment="left"
                type="submit"
                form="new-vestiging-form"
              >
                Voeg toe
              </AuButton>
            </AuButtonGroup>
            <Save @showSaveError={{@controller.hasValidationErrors}} />
          </div>
        </:action>
      </PageHeader>

      <form
        id="new-vestiging-form"
        {{on "submit" (perform @controller.createSiteTask)}}
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
                    @errorMessage={{@model.site.error.siteType.message}}
                  >
                    <:label>Type vestiging</:label>
                    <:content as |hasError|>
                      <SiteTypeSelect
                        @selected={{@model.site.siteType}}
                        @onChange={{fn (mut @model.site.siteType)}}
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
                  <Item>
                    <:label>Primair correspondentieadres</:label>
                    <:content>
                      <AuRadioGroup
                        @alignment="inline"
                        @name="is-primary-site"
                        @selected={{@controller.isPrimarySite}}
                        @onChange={{fn (mut @controller.isPrimarySite)}}
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
            @address={{@model.address}}
            @primaryContact={{@model.contact}}
            @secondaryContact={{@model.secondaryContact}}
          >
            <:title>Contactgegevens</:title>
          </ContactEditCard>
        </div>
      </form>
    </div>
  </div>
</template>
