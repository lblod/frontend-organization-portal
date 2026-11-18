import PageHeader from '../../../../components/page-header';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import SaveError from '../../../../components/error/save';
import ReportWrongData from '../../../../components/report-wrong-data';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import EditCard from '../../../../components/edit-card';
import TrimInput from '../../../../components/trim-input';
import { fn, hash } from '@ember/helper';
import helpText from '../../../../helpers/help-text';
import or from 'ember-truth-helpers/helpers/or';
import PowerSelect from 'ember-power-select/components/power-select';
import LegalFormSelect from '../../../../components/legal-form-select';
import not from 'ember-truth-helpers/helpers/not';
import isFeatureEnabled from '../../../../helpers/is-feature-enabled';
import ContentThemeSelect from '../../../../components/content-theme-select';
import requiresAdditionalQualifications from '../../../../helpers/requires-additional-qualifications';
import AdditionalQualificationsSelect from '../../../../components/additional-qualifications-select';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import RecognizedWorshipTypeSelect from '../../../../components/recognized-worship-type-select';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import boolean from '../../../../helpers/boolean';
import and from 'ember-truth-helpers/helpers/and';
import LocationMultipleSelect from '../../../../components/location-multiple-select';
import Datepicker from '../../../../components/datepicker';
import RichTextEditor from '../../../../components/rich-text-editor';
import requiresKbo from '../../../../helpers/requires-kbo';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import auInputmask from '@appuniversum/ember-appuniversum/modifiers/au-inputmask';
import KboNumber from '../../../../components/error/kbo-number';
import editableContactData from '../../../../helpers/editable-contact-data';
import ContactEditCard from '../../../../components/site/contact-edit-card';
import ContactDataCard from '../../../../components/site/contact-data-card';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box">
      <PageHeader class="au-u-margin-bottom-large">
        <:title>Bewerk kerngegevens</:title>
        <:subtitle>{{@model.organization.abbName}}
          ({{@model.organization.classification.label}})</:subtitle>
        <:action>
          <div class="au-u-text-right">
            <AuButtonGroup class="au-c-button-group--align-right">
              <AuLink
                @route="organizations.organization.core-data"
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
            <SaveError @showSaveError={{@controller.hasValidationErrors}} />
            <ReportWrongData />
          </div>
        </:action>
      </PageHeader>

      <form
        id="edit-core-info-form"
        aria-label="edit-core-info-form"
        {{on "submit" (perform @controller.save)}}
      >
        <div class="au-o-flow au-o-flow--large">
          <EditCard @containsRequiredFields={{true}}>
            <:title>Organisatie</:title>
            <:card as |Card|>
              <Card.Columns>
                <:left as |Item|>
                  <Item @labelFor="organization-abb-name" @required={{true}}>
                    <:label>Naam</:label>
                    <:content as |hasError|>
                      <TrimInput
                        @width="block"
                        @disabled={{true}}
                        @value={{@model.organization.abbName}}
                        @onUpdate={{fn (mut @model.organization.name)}}
                        @error={{hasError}}
                        id="organization-abb-name"
                      />
                    </:content>
                    <:helpText>
                      {{helpText "abbName"}}
                    </:helpText>
                  </Item>
                  <Item
                    @labelFor="organization-legal-name"
                    @required={{true}}
                    @errorMessage={{@model.organization.error.legalName.message}}
                  >
                    <:label>Juridische naam</:label>
                    <:content as |hasError|>
                      <TrimInput
                        @width="block"
                        @disabled={{or
                          @model.organization.isMunicipality
                          @model.organization.isProvince
                        }}
                        @value={{@model.organization.legalName}}
                        @onUpdate={{@controller.setNames}}
                        @error={{hasError}}
                        id="organization-legal-name"
                      />
                    </:content>
                    <:helpText>
                      {{helpText "legalName"}}
                    </:helpText>
                  </Item>
                  <Item
                    @labelFor="organization-alternative-names"
                    @required={{false}}
                  >
                    <:label>Alternatieve naam</:label>
                    <:content as |hasError|>
                      <TrimInput
                        @width="block"
                        @disabled={{false}}
                        @value={{@model.organization.alternativeName}}
                        @onUpdate={{@controller.setAlternativeNames}}
                        @error={{hasError}}
                        id="organization-alternative-names"
                      />
                    </:content>
                    <:helpText>
                      {{helpText "alternativeNames"}}
                    </:helpText>
                  </Item>
                  <Item @labelFor="classification">
                    <:label>Type bestuur</:label>
                    <:content>
                      <PowerSelect
                        @disabled={{true}}
                        @selected={{@model.organization.classification}}
                        @onChange={{fn
                          (mut @model.organization.classification)
                        }}
                        @triggerId="classification"
                        as |classification|
                      >
                        {{classification.label}}
                      </PowerSelect>
                    </:content>
                  </Item>
                  {{#unless @model.organization.isWorshipAdministrativeUnit}}
                    <Item
                      @labelFor="legal-form"
                      @required={{true}}
                      @errorMessage={{@model.organization.error.legalForm.message}}
                    >
                      <:label>Juridische vorm</:label>
                      <:content as |hasError|>
                        <LegalFormSelect
                          @selected={{@model.organization.legalForm}}
                          @onChange={{fn (mut @model.organization.legalForm)}}
                          @disabled={{not
                            (isFeatureEnabled "legal-form-editable")
                          }}
                          @error={{hasError}}
                          @triggerId="legal-form"
                          @id="legal-form-select"
                        />
                      </:content>
                    </Item>
                  {{/unless}}
                  {{#if @model.organization.requiresContentThemes}}
                    <Item
                      @labelFor="content-theme-select"
                      @required={{true}}
                      @errorMessage={{@model.organization.error.contentThemes.message}}
                    >
                      <:label>Inhoudelijk thema</:label>
                      <:content as |hasError|>
                        <ContentThemeSelect
                          @selected={{@model.organization.contentThemes}}
                          @onChange={{fn
                            (mut @model.organization.contentThemes)
                          }}
                          @error={{hasError}}
                          @id="content-theme-select"
                        />
                      </:content>
                    </Item>
                  {{/if}}
                  {{#if
                    (requiresAdditionalQualifications
                      @model.organization.classification
                    )
                  }}
                    <Item
                      @labelFor="additional-qualifications-select"
                      @required={{true}}
                      @errorMessage={{@model.organization.error.additionalQualifications.message}}
                    >
                      <:label>Bijkomende kwalificatie(s)</:label>
                      <:content as |hasError|>
                        <AdditionalQualificationsSelect
                          @selected={{@model.organization.additionalQualifications}}
                          @onChange={{fn
                            (mut @model.organization.additionalQualifications)
                          }}
                          @error={{hasError}}
                          @id="additional-qualifications-select"
                        />
                      </:content>
                    </Item>
                    {{#if @model.organization.additionalQualifications}}
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
                  {{/if}}
                  {{#if @model.organization.isWorshipAdministrativeUnit}}
                    <Item
                      @labelFor="recognized-worship-type-select"
                      @required={{true}}
                      @errorMessage={{@model.organization.error.recognizedWorshipType.message}}
                    >
                      <:label>Soort eredienst</:label>
                      <:content as |hasError|>
                        <RecognizedWorshipTypeSelect
                          @selected={{@model.organization.recognizedWorshipType}}
                          @onChange={{fn
                            (mut @model.organization.recognizedWorshipType)
                          }}
                          @allowClear={{false}}
                          @error={{hasError}}
                          @id="recognized-worship-type-select"
                        />
                      </:content>
                    </Item>
                  {{/if}}
                  {{#if @model.organization.isWorshipService}}
                    <Item @labelFor="denomination">
                      <:label>Strekking</:label>
                      <:content>
                        <TrimInput
                          @width="block"
                          @value={{@model.organization.denomination}}
                          @onUpdate={{fn
                            (mut @model.organization.denomination)
                          }}
                          id="denomination"
                        />
                      </:content>
                    </Item>
                    <Item>
                      <:label>Grensoverschrijvend</:label>
                      <:content>
                        <AuRadioGroup
                          @alignment="inline"
                          @name="is-cross-border"
                          @selected={{boolean @model.organization.crossBorder}}
                          @onChange={{fn (mut @model.organization.crossBorder)}}
                          as |Group|
                        >
                          <Group.Radio @value={{true}}>Ja</Group.Radio>
                          <Group.Radio @value={{false}}>Nee</Group.Radio>
                        </AuRadioGroup>
                      </:content>
                    </Item>
                  {{/if}}
                  {{#if
                    (and
                      @model.organization.displayRegion @model.regions.length
                    )
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
                    <Item
                      @labelFor="scope"
                      @required={{true}}
                      @errorMessage={{@model.organization.error.scope.message}}
                    >
                      <:label>Werkingsgebied</:label>
                      <:content>
                        <LocationMultipleSelect
                          @selected={{@controller.locationsInScope}}
                          @onChange={{fn (mut @controller.locationsInScope)}}
                          @disabled={{@model.organization.disableScopeEdits}}
                          @error={{@model.organization.error.scope}}
                          @id="locations-select"
                        />
                      </:content>
                    </Item>
                  {{/if}}
                  {{#if @model.organization.isIgs}}
                    <Item
                      @labelFor="expectedEndDate"
                      @errorMessage={{@model.organization.error.expectedEndDate.message}}
                    >
                      <:label>Geplande einddatum</:label>
                      <:content as |hasError|>
                        <Datepicker
                          @onChange={{fn
                            (mut @model.organization.expectedEndDate)
                          }}
                          @value={{@model.organization.expectedEndDate}}
                          @error={{hasError}}
                        />
                      </:content>
                    </Item>
                    <Item @labelFor="purpose">
                      <:label>Doel</:label>
                      <:content>
                        <RichTextEditor
                          @onChange={{fn (mut @model.organization.purpose)}}
                          @value={{@model.organization.purpose}}
                        />
                      </:content>
                    </Item>
                  {{/if}}
                </:left>
                <:right as |Item|>
                  <Item @labelFor="status-select">
                    <:label>Status</:label>
                    <:content>
                      <PowerSelect
                        @noMatchesMessage="Geen resultaten"
                        @options={{@model.statuses}}
                        @selected={{@model.organization.organizationStatus}}
                        @onChange={{fn
                          (mut @model.organization.organizationStatus)
                        }}
                        @disabled={{true}}
                        @triggerId="status-select"
                        as |status|
                      >
                        {{status.label}}
                      </PowerSelect>
                    </:content>
                  </Item>
                  {{#if (requiresKbo @model.organization)}}
                    <Item
                      @labelFor="kbo-identifier"
                      @errorMessage={{@model.identifierKBO.error.structuredIdentifier}}
                      @required={{true}}
                    >
                      <:label>{{@model.identifierKBO.idName}}</:label>
                      <:content as |hasError|>
                        <AuInput
                          @width="block"
                          @error={{hasError}}
                          autocomplete="off"
                          value={{@model.structuredIdentifierKBO.localId}}
                          id="kbo-identifier"
                          class="au-c-input--mask"
                          placeholder="____.___.___"
                          {{auInputmask
                            options=(hash mask="####.###.###" placeholder="_")
                          }}
                          {{on "input" @controller.setKbo}}
                        />
                      </:content>
                      <:error as |error|>
                        <KboNumber @error={{error}} />
                      </:error>
                    </Item>
                  {{/if}}
                  <Item
                    @labelFor="sharepoint-identifier"
                    @errorMessage={{@model.identifierSharepoint.error.structuredIdentifier.message}}
                  >
                    <:label>{{@model.identifierSharepoint.idName}}</:label>
                    <:content as |hasError|>
                      <TrimInput
                        @width="block"
                        @value={{@model.structuredIdentifierSharepoint.localId}}
                        @onUpdate={{fn
                          (mut @model.structuredIdentifierSharepoint.localId)
                        }}
                        @error={{hasError}}
                        id="sharepoint-identifier"
                      />
                    </:content>
                  </Item>
                  {{#if
                    (or
                      @model.organization.isMunicipality
                      @model.organization.isProvince
                    )
                  }}
                    <Item @labelFor="nis-identifier">
                      <:label>{{@model.identifierNIS.idName}}</:label>
                      <:content>
                        {{@model.organization.scope.exactMatch.notation}}
                      </:content>
                    </Item>
                  {{/if}}
                  {{#if @model.structuredIdentifierOVO.localId}}
                    <Item @labelFor="ovo-identifier">
                      <:label>{{@model.identifierOVO.idName}}</:label>
                      <:content>
                        {{@model.structuredIdentifierOVO.localId}}
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
          </EditCard>
          {{#if (editableContactData @model.organization)}}
            <ContactEditCard
              @address={{@model.address}}
              @isAddressSearchEnabledInitially={{if
                (or (not @model.address.id) @model.address.addressRegisterUri)
                true
                false
              }}
              @primaryContact={{@model.contact}}
              @secondaryContact={{@model.secondaryContact}}
            >
              <:title>Primaire contactgegevens</:title>
            </ContactEditCard>
          {{else}}
            <ContactDataCard
              @address={{@model.organization.primarySite.address}}
              @primaryContact={{@model.primaryContact}}
              @secondaryContact={{@model.secondaryContact}}
            >
              <:title>
                Primaire contactgegevens
              </:title>
              <:infotext>
                De primaire contactgegevens kunnen niet langer in het OP
                aangepast worden. De organisaties kunnen deze gegevens zelf
                aanpassen via de Contactapp.
              </:infotext>
            </ContactDataCard>
          {{/if}}
        </div>
      </form>
    </div>
  </div>
</template>
