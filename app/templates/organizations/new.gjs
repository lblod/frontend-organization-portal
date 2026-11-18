import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import PageHeader from 'frontend-organization-portal/components/page-header';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import SaveError from 'frontend-organization-portal/components/error/save';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import EditCard from 'frontend-organization-portal/components/edit-card';
import TrimInput from 'frontend-organization-portal/components/trim-input';
import { fn, hash } from '@ember/helper';
import helpText from 'frontend-organization-portal/helpers/help-text';
import ClassificationSelect from 'frontend-organization-portal/components/classification-select';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import LegalFormSelect from 'frontend-organization-portal/components/legal-form-select';
import ContentThemeSelect from 'frontend-organization-portal/components/content-theme-select';
import requiresAdditionalQualifications from 'frontend-organization-portal/helpers/requires-additional-qualifications';
import AdditionalQualificationsSelect from 'frontend-organization-portal/components/additional-qualifications-select';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import RecognizedWorshipTypeSelect from 'frontend-organization-portal/components/recognized-worship-type-select';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import boolean from 'frontend-organization-portal/helpers/boolean';
import or from 'ember-truth-helpers/helpers/or';
import LocationMultipleSelect from 'frontend-organization-portal/components/location-multiple-select';
import Datepicker from 'frontend-organization-portal/components/datepicker';
import RichTextEditor from 'frontend-organization-portal/components/rich-text-editor';
import OrganizationStatusSelect from 'frontend-organization-portal/components/organization-status-select';
import requiresKbo from 'frontend-organization-portal/helpers/requires-kbo';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import auInputmask from '@appuniversum/ember-appuniversum/modifiers/au-inputmask';
import KboNumber from 'frontend-organization-portal/components/error/kbo-number';
import editableContactData from 'frontend-organization-portal/helpers/editable-contact-data';
import ContactEditCard from 'frontend-organization-portal/components/site/contact-edit-card';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import WorshipServiceMultipleSelect from 'frontend-organization-portal/components/worship-service-multiple-select';
import CentralWorshipSelect from 'frontend-organization-portal/components/central-worship-select';
import RepresentativeBodySelect from 'frontend-organization-portal/components/representative-body-select';
import MunicipalitySelect from 'frontend-organization-portal/components/municipality-select';
import ProvinceOrganizationSelect from 'frontend-organization-portal/components/province-organization-select';
import OrganizationMultipleSelect from 'frontend-organization-portal/components/organization-multiple-select';
import OrganizationSelect from 'frontend-organization-portal/components/organization-select';
import ConfirmationModal from 'frontend-organization-portal/components/confirmation-modal';
import confirmationMessageText from 'frontend-organization-portal/helpers/confirmation-message-text';

<template>
  {{pageTitle "Voeg organisatie toe"}}
  {{breadcrumb "Voeg organisatie toe"}}

  <div class="au-c-body-container au-c-body-container--scroll">
    <PageHeader class="au-u-margin au-u-margin-bottom-large">
      <:title>Voeg organisatie toe</:title>
      <:action>
        <div class="au-u-text-right">
          <AuButtonGroup class="au-c-button-group--align-right">
            <AuLink @route="organizations" @skin="button-secondary">
              Annuleer
            </AuLink>
            <AuButton
              @loading={{@controller.createOrganizationTask.isRunning}}
              @loadingMessage="Voeg toe"
              type="submit"
              form="organization-creation-form"
              @icon="add"
              @iconAlignment="left"
            >
              Voeg toe
            </AuButton>
          </AuButtonGroup>
          <SaveError @showSaveError={{@controller.hasValidationErrors}} />
        </div>
      </:action>
    </PageHeader>

    <form
      class="au-o-box au-o-flow au-o-flow--large"
      id="organization-creation-form"
      aria-label="organization-creation-form"
      {{on "submit" (perform @controller.createOrganizationTask)}}
    >
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
                    @value={{@controller.currentOrganizationModel.abbName}}
                    @onUpdate={{fn
                      (mut @controller.currentOrganizationModel.name)
                    }}
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
                @errorMessage={{@controller.currentOrganizationModel.error.legalName.message}}
              >
                <:label>Juridische naam</:label>
                <:content as |hasError|>
                  <TrimInput
                    @width="block"
                    @value={{@controller.currentOrganizationModel.legalName}}
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
                    @value={{@controller.currentOrganizationModel.alternativeName}}
                    @onUpdate={{@controller.setAlternativeNames}}
                    @error={{hasError}}
                    id="organization-alternative-names"
                  />
                </:content>
                <:helpText>
                  {{helpText "alternativeNames"}}
                </:helpText>
              </Item>
              <Item
                @labelFor="classification-select"
                @required={{true}}
                @errorMessage={{@controller.currentOrganizationModel.error.classification.message}}
              >
                <:label>Type organisatie</:label>
                <:content as |hasError|>
                  <ClassificationSelect
                    @selected={{@controller.currentOrganizationModel.classification}}
                    @selectedRecognizedWorshipTypeId={{@controller.currentOrganizationModel.recognizedWorshipType.id}}
                    @onChange={{@controller.organizationConverter}}
                    @restrictForNewOrganizations={{true}}
                    @error={{hasError}}
                    @id="classification-select"
                  />
                </:content>
              </Item>
              {{#if
                (and
                  @controller.currentOrganizationModel.classification
                  (not
                    @controller.currentOrganizationModel.isWorshipAdministrativeUnit
                  )
                )
              }}
                <Item
                  @labelFor="legal-form-select"
                  @required={{true}}
                  @errorMessage={{@controller.currentOrganizationModel.error.legalForm.message}}
                >
                  <:label>Juridische vorm</:label>
                  <:content as |hasError|>
                    <LegalFormSelect
                      @selected={{@controller.currentOrganizationModel.legalForm}}
                      @onChange={{@controller.setLegalForm}}
                      @error={{hasError}}
                      @id="legal-form-select"
                    />
                  </:content>
                </Item>
              {{/if}}
              {{#if
                (and
                  @controller.currentOrganizationModel.classification
                  @controller.currentOrganizationModel.requiresContentThemes
                )
              }}
                <Item
                  @labelFor="content-theme-select"
                  @required={{true}}
                  @errorMessage={{@controller.currentOrganizationModel.error.contentThemes.message}}
                >
                  <:label>Inhoudelijk thema</:label>
                  <:content as |hasError|>
                    <ContentThemeSelect
                      @selected={{@controller.currentOrganizationModel.contentThemes}}
                      @onChange={{@controller.setContentThemes}}
                      @error={{hasError}}
                      @id="content-theme-select"
                    />
                  </:content>
                </Item>
              {{/if}}

              {{#if
                (requiresAdditionalQualifications
                  @controller.currentOrganizationModel.classification
                )
              }}
                <Item
                  @labelFor="additional-qualifications-select"
                  @required={{true}}
                  @errorMessage={{@controller.currentOrganizationModel.error.additionalQualifications.message}}
                >
                  <:label>Bijkomende kwalificatie(s)</:label>
                  <:content as |hasError|>
                    <AdditionalQualificationsSelect
                      @selected={{@controller.currentOrganizationModel.additionalQualifications}}
                      @onChange={{fn
                        (mut
                          @controller.currentOrganizationModel.additionalQualifications
                        )
                      }}
                      @error={{hasError}}
                      @id="additional-qualifications-select"
                    />
                  </:content>
                </Item>
                {{#if
                  @controller.currentOrganizationModel.additionalQualifications
                }}
                  <Item>
                    <:label>Rechtsgrond</:label>
                    <:content>
                      <AuList @divider={{true}} as |Item|>
                        {{#each
                          @controller.currentOrganizationModel.additionalQualifications
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

              {{#if
                @controller.currentOrganizationModel.isWorshipAdministrativeUnit
              }}
                <Item
                  @labelFor="recognized-worship-type-select"
                  @required={{true}}
                  @errorMessage={{@controller.currentOrganizationModel.error.recognizedWorshipType.message}}
                >
                  <:label>Soort eredienst</:label>
                  <:content as |hasError|>
                    <RecognizedWorshipTypeSelect
                      @selected={{@controller.currentOrganizationModel.recognizedWorshipType}}
                      @onChange={{@controller.setRecognizedWorshipType}}
                      @allowClear={{true}}
                      @selectedClassificationId={{@controller.currentOrganizationModel.classification.id}}
                      @error={{hasError}}
                      @id="recognized-worship-type-select"
                    />
                  </:content>
                </Item>
              {{/if}}
              {{#if @controller.currentOrganizationModel.isWorshipService}}
                <Item @labelFor="denomination">
                  <:label>Strekking</:label>
                  <:content>
                    <TrimInput
                      @width="block"
                      @value={{@controller.currentOrganizationModel.denomination}}
                      @onUpdate={{fn
                        (mut @controller.currentOrganizationModel.denomination)
                      }}
                      id="denomination"
                    />
                  </:content>
                </Item>
                <Item @alignTop={{true}}>
                  <:label>Grensoverschrijvend</:label>
                  <:content>
                    <AuRadioGroup
                      @alignment="inline"
                      @name="is-cross-border"
                      @selected={{boolean
                        @controller.currentOrganizationModel.crossBorder
                      }}
                      @onChange={{fn
                        (mut @controller.currentOrganizationModel.crossBorder)
                      }}
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
                  @controller.currentOrganizationModel.isMunicipality
                  @controller.currentOrganizationModel.scope.locatedWithin
                )
              }}
                <Item @labelFor="regio">
                  <:label>Regio</:label>
                  <:content>
                    {{@controller.currentOrganizationModel.scope.locatedWithin}}
                  </:content>
                </Item>
              {{/if}}
              {{#if
                (or
                  @controller.currentOrganizationModel.isAdministrativeUnit
                  @controller.currentOrganizationModel.isZorgraad
                  @controller.currentOrganizationModel.isRegionaalZorgplatform
                  @controller.currentOrganizationModel.isRegionaalLandschap
                  @controller.currentOrganizationModel.isBosgroep
                  @controller.currentOrganizationModel.isWoonmaatschappij
                  @controller.currentOrganizationModel.isPrivateOcmwAssociation
                )
              }}
                <Item
                  @labelFor="scope"
                  @required={{true}}
                  @errorMessage={{@controller.currentOrganizationModel.error.scope.message}}
                >
                  <:label>Werkingsgebied</:label>
                  <:content>
                    <LocationMultipleSelect
                      @selected={{@controller.locations}}
                      @onChange={{fn (mut @controller.locations)}}
                      @disabled={{false}}
                      @error={{@controller.currentOrganizationModel.error.scope}}
                      @id="locations-select"
                    />
                  </:content>
                </Item>
              {{/if}}
              {{#if @controller.currentOrganizationModel.isIgs}}
                <Item
                  @labelFor="expectedEndDate"
                  @errorMessage={{@controller.currentOrganizationModel.error.expectedEndDate.message}}
                >
                  <:label>Geplande einddatum</:label>
                  <:content as |hasError|>
                    <Datepicker
                      @onChange={{fn
                        (mut
                          @controller.currentOrganizationModel.expectedEndDate
                        )
                      }}
                      @error={{hasError}}
                    />
                  </:content>
                </Item>
                <Item @labelFor="purpose">
                  <:label>Doel</:label>
                  <:content>
                    <RichTextEditor
                      @onChange={{fn
                        (mut @controller.currentOrganizationModel.purpose)
                      }}
                      @value={{@controller.currentOrganizationModel.purpose}}
                    />
                  </:content>
                </Item>
              {{/if}}
            </:left>
            <:right as |Item|>
              <Item
                @labelFor="status-select"
                @required={{true}}
                @errorMessage={{@controller.currentOrganizationModel.error.organizationStatus.message}}
              >
                <:label>Status</:label>
                <:content as |hasError|>
                  <OrganizationStatusSelect
                    @selected={{@controller.currentOrganizationModel.organizationStatus}}
                    @onChange={{fn
                      (mut
                        @controller.currentOrganizationModel.organizationStatus
                      )
                    }}
                    @error={{hasError}}
                    @id="status-select"
                  />
                </:content>
              </Item>
              {{#if
                (and
                  @controller.currentOrganizationModel.classification
                  (requiresKbo @controller.currentOrganizationModel)
                )
              }}
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
            </:right>
          </Card.Columns>
        </:card>
      </EditCard>

      {{#if (editableContactData @controller.currentOrganizationModel)}}
        <ContactEditCard
          @address={{@model.address}}
          @primaryContact={{@model.contact}}
          @secondaryContact={{@model.secondaryContact}}
        >
          <:title>Primaire contactgegevens</:title>
        </ContactEditCard>
      {{else}}
        <div class="au-u-max-width-large">
          <AuHeading @level="3" @skin="5" class="au-u-margin-bottom-tiny">
            Primaire contactgegevens
          </AuHeading>
          <p class="au-u-margin-bottom-small">
            De primaire contactgegevens kunnen niet langer in het OP ingegeven
            worden. Gelieve de contactgegevens (adres, telefoonnummers, e-mail
            en website) in te geven in de
            <AuLinkExternal
              href="https://controle.contactgegevens.lokaalbestuur.vlaanderen.be/"
            >
              controle omgeving van de contactapp
            </AuLinkExternal>. Deze contactgegevens stromen door naar het
            OrganisatiePortaal. De organisaties kunnen hun eigen gegevens nadien
            zelf aanpassen via de Contactapp.
          </p>
        </div>
      {{/if}}

      {{#if
        (and
          @controller.currentOrganizationModel.classification
          (or
            @controller.currentOrganizationModel.isWorshipAdministrativeUnit
            @controller.currentOrganizationModel.isAgb
            @controller.currentOrganizationModel.isApb
            @controller.membershipFields.length
          )
        )
      }}
        <EditCard
          @containsRequiredFields={{@controller.containsRequiredFields}}
        >
          <:title>Gerelateerde organisaties</:title>
          <:card as |Card|>
            <AuHelpText @skin="tertiary" class="au-u-margin-bottom-small">
              Op de pagina ‘Gerelateerde organisaties’ worden zowel onderstaande
              als andere relaties getoond.
            </AuHelpText>
            {{#if
              @controller.currentOrganizationModel.isWorshipAdministrativeUnit
            }}
              <Card.Columns>
                <:left as |Item|>
                  {{#if
                    @controller.currentOrganizationModel.isCentralWorshipService
                  }}
                    <Item @labelFor="related-worship-services">
                      <:label>Bestuur van de eredienst</:label>
                      <:content>
                        <WorshipServiceMultipleSelect
                          @selected={{@controller.worshipServices}}
                          @onChange={{@controller.addWorshipServices}}
                          id="related-worship-services"
                        />
                      </:content>
                    </Item>
                  {{/if}}
                  {{#if
                    @controller.currentOrganizationModel.hasCentralWorshipService
                  }}
                    <Item
                      @labelFor="related-central-worship-service"
                      @required={{false}}
                    >
                      <:label>Centraal bestuur</:label>
                      <:content as |hasError|>
                        <CentralWorshipSelect
                          @selected={{@controller.centralWorshipService}}
                          @onChange={{@controller.addCentralWorshipService}}
                          @error={{hasError}}
                          @id="related-central-worship-service"
                        />
                      </:content>
                    </Item>
                  {{/if}}
                  <Item
                    @labelFor="related-representative-body"
                    @required={{true}}
                    @errorMessage={{@controller.representativeBodyError}}
                  >
                    <:label>Representatief orgaan</:label>
                    <:content as |hasError|>
                      <RepresentativeBodySelect
                        @selected={{@controller.representativeBody}}
                        @onChange={{@controller.addRepresentativeBody}}
                        @error={{hasError}}
                        @id="related-representative-body"
                      />
                    </:content>
                  </Item>
                </:left>
              </Card.Columns>
            {{else}}
              <Card.Columns>
                <:left as |Item|>
                  {{! The AGB/APB blocks render their founder field themselves,
                    the other fields come from the per-type configuration. }}
                  {{#if @controller.currentOrganizationModel.isAgb}}
                    <Item
                      @labelFor="related-gemeente"
                      @required={{true}}
                      @errorMessage={{@controller.municipalityError}}
                    >
                      <:label>Gemeente</:label>
                      <:content as |hasError|>
                        <MunicipalitySelect
                          @selected={{@controller.municipality}}
                          @onChange={{@controller.setMunicipality}}
                          @error={{hasError}}
                          @id="related-gemeente"
                        />
                      </:content>
                    </Item>

                    {{#if @controller.municipality}}
                      <Item>
                        <:label>Provincie</:label>
                        <:content>{{@controller.province.abbName}}</:content>
                      </Item>
                    {{/if}}

                    <Item @required={{true}}>
                      <:label>Is opgericht door</:label>
                      <:content>{{@controller.municipality.abbName}}</:content>
                    </Item>
                  {{else if @controller.currentOrganizationModel.isApb}}
                    <Item
                      @labelFor="related-province"
                      @required={{true}}
                      @errorMessage={{@controller.provinceError}}
                    >
                      <:label>Provincie</:label>
                      <:content as |hasError|>
                        <ProvinceOrganizationSelect
                          @selected={{@controller.province}}
                          @allowClear={{true}}
                          @onChange={{@controller.setProvince}}
                          @error={{hasError}}
                          @id="related-province"
                        />
                      </:content>
                    </Item>

                    <Item @labelFor="founder-province" @required={{true}}>
                      <:label>Is opgericht door</:label>
                      <:content>{{@controller.province.abbName}}</:content>
                    </Item>
                  {{/if}}

                  {{! The related-organization fields per organization type }}
                  {{#each @controller.membershipFields key="key" as |field|}}
                    <Item
                      @labelFor={{field.key}}
                      @required={{field.required}}
                      @errorMessage={{field.error}}
                    >
                      <:label>{{field.label}}</:label>
                      <:content as |hasError|>
                        {{#if field.multiple}}
                          <OrganizationMultipleSelect
                            @selected={{field.selectedOrganizations}}
                            @onChange={{fn
                              @controller.addOrganizationsForField
                              field
                            }}
                            @classificationCodes={{field.classificationCodes}}
                            @error={{hasError}}
                            @id={{field.key}}
                          />
                        {{else}}
                          <OrganizationSelect
                            @selected={{field.selectedOrganization}}
                            @onChange={{fn
                              @controller.setOrganizationForField
                              field
                            }}
                            @classificationCodes={{field.classificationCodes}}
                            @allowClear={{true}}
                            @error={{hasError}}
                            @id={{field.key}}
                          />
                        {{/if}}
                      </:content>
                    </Item>
                  {{/each}}
                </:left>
              </Card.Columns>
            {{/if}}
          </:card>
        </EditCard>
      {{/if}}
    </form>
  </div>

  {{#if @controller.isRelatedNonActiveOrganization}}
    <ConfirmationModal
      @message={{confirmationMessageText "nonActiveRelatedOrganization"}}
      @onConfirm={{@controller.confirmRelateNonActiveOrganization}}
      @onCancel={{@controller.cancelRelateNonActiveOrganization}}
    />
  {{/if}}
</template>
