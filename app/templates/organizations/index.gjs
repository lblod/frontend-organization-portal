import SidebarContainer from 'frontend-organization-portal/components/sidebar-container';
import { on } from '@ember/modifier';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import OrganizationSelectByName from 'frontend-organization-portal/components/organization-select-by-name';
import OrganizationSelectByIdentifier from 'frontend-organization-portal/components/organization-select-by-identifier';
import LocationMultipleSelect from 'frontend-organization-portal/components/location-multiple-select';
import MunicipalitySelectByName from 'frontend-organization-portal/components/municipality-select-by-name';
import ProvinceSelect from 'frontend-organization-portal/components/province-select';
import OrganizationTypeMultipleSelect from 'frontend-organization-portal/components/organization-type-multiple-select';
import ClassificationMultipleSelect from 'frontend-organization-portal/components/classification-multiple-select';
import RecognizedWorshipTypeSelect from 'frontend-organization-portal/components/recognized-worship-type-select';
import OrganizationStatusSelect from 'frontend-organization-portal/components/organization-status-select';
import LegalFormMultipleSelect from 'frontend-organization-portal/components/legal-form-multiple-select';
import VendorSelect from 'frontend-organization-portal/components/vendor-select';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import PageHeader from 'frontend-organization-portal/components/page-header';
import readOnly from 'frontend-organization-portal/helpers/read-only';
import EditsDisabledMessage from 'frontend-organization-portal/components/edits-disabled-message';
import SecuredArea from 'frontend-organization-portal/components/secured-area';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table-th-sortable';
import ErrorTableMessage from 'frontend-organization-portal/components/table-message/error';
import TableMessage from 'frontend-organization-portal/components/table-message';
import config from 'ember-config-helper/helpers/config';
import OrganizationStatus from 'frontend-organization-portal/components/organization-status';

<template>
  <SidebarContainer>
    <:sidebar>
      <div class="au-c-sidebar">
        <div class="au-c-sidebar__content au-o-box">
          <form
            {{on "reset" @controller.resetFilters}}
            class="au-o-grid au-o-grid--small"
          >
            <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
              <AuLabel for="filter-name">Naam</AuLabel>
              <OrganizationSelectByName
                @id="filter-name"
                {{! ember-power-select v8+ introduced a regression bug related to empty string values, so we explicitly convert it to undefined if needed. More info: https://github.com/ember-power-addons/ember-power-select/issues/2082 }}
                @selected={{if @controller.name @controller.name}}
                @onChange={{@controller.setName}}
                @selectedProvince={{@controller.province}}
                @selectedMunicipality={{@controller.municipality}}
                @selectedOrganizationTypes={{@controller.organizationTypes}}
                @selectedClassificationIds={{@controller.classificationIds}}
                @selectedRecognizedWorshipTypeId={{@controller.recognizedWorshipTypeId}}
                @selectedOrganizationStatus={{@controller.organizationStatus}}
                @selectedIdentifier={{@controller.identifier}}
                class="grow"
              />
            </div>
            <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
              <AuLabel for="filter-identifier">Identificator</AuLabel>
              <OrganizationSelectByIdentifier
                @id="filter-identifier"
                {{! ember-power-select v8+ introduced a regression bug related to empty string values, so we explicitly convert it to undefined if needed. More info: https://github.com/ember-power-addons/ember-power-select/issues/2082 }}
                @selected={{if @controller.identifier @controller.identifier}}
                @onChange={{@controller.setIdentifier}}
                @selectedProvince={{@controller.province}}
                @selectedMunicipality={{@controller.municipality}}
                @selectedOrganizationTypes={{@controller.organizationTypes}}
                @selectedClassificationIds={{@controller.classificationIds}}
                @selectedRecognizedWorshipTypeId={{@controller.recognizedWorshipTypeId}}
                @selectedOrganizationStatus={{@controller.organizationStatus}}
                @selectedName={{@controller.name}}
                class="grow"
              />
            </div>
            <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
              <AuLabel for="filter-operation-area">Werkingsgebied</AuLabel>
              <LocationMultipleSelect
                @selected={{@controller.operationArea}}
                @onChange={{@controller.setOperationArea}}
                @id="filter-operation-area"
                @filterMode={{true}}
              />
            </div>
            <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
              <AuLabel for="filter-municipality">Gemeente</AuLabel>
              <MunicipalitySelectByName
                {{! ember-power-select v8+ introduced a regression bug related to empty string values, so we explicitly convert it to undefined if needed. More info: https://github.com/ember-power-addons/ember-power-select/issues/2082 }}
                @selected={{if
                  @controller.municipality
                  @controller.municipality
                }}
                @onChange={{@controller.setMunicipality}}
                @selectedProvince={{@controller.province}}
                @id="filter-municipality"
              />
            </div>
            <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
              <AuLabel for="filter-province">Provincie</AuLabel>
              <ProvinceSelect
                {{! ember-power-select v8+ introduced a regression bug related to empty string values, so we explicitly convert it to undefined if needed. More info: https://github.com/ember-power-addons/ember-power-select/issues/2082 }}
                @selected={{if @controller.province @controller.province}}
                @onChange={{@controller.setProvince}}
                @selectedMunicipality={{@controller.municipality}}
                @id="filter-province"
              />
            </div>
            {{#if @controller.currentSession.hasUnitRole}}
              <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
                <AuLabel for="organization-type">Type organisatie</AuLabel>
                <OrganizationTypeMultipleSelect
                  @selected={{@controller.organizationTypes}}
                  @onChange={{@controller.setOrganizationTypes}}
                  @selectedClassificationIds={{@controller.classificationIds}}
                  @allowClear={{true}}
                  @id="organization-type"
                />
              </div>
            {{/if}}
            <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
              <AuLabel for="classification">Type</AuLabel>
              <ClassificationMultipleSelect
                @selected={{@controller.classificationIds}}
                @onChange={{@controller.setClassificationIds}}
                @allowClear={{true}}
                @selectedRecognizedWorshipTypeId={{@controller.recognizedWorshipTypeId}}
                @selectedOrganizationTypes={{@controller.organizationTypes}}
                @id="classification"
              />
            </div>
            {{#if @controller.currentSession.hasWorshipRole}}
              <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
                <AuLabel for="recognized-worship-types">Soort eredienst</AuLabel>
                <RecognizedWorshipTypeSelect
                  @selected={{@controller.recognizedWorshipTypeId}}
                  @onChange={{@controller.setRecognizedWorshipTypeId}}
                  @allowClear={{true}}
                  @selectedClassificationId={{@controller.classificationIds}}
                  @id="recognized-worship-types"
                />
              </div>
            {{/if}}
            <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
              <AuLabel for="statuses">Status</AuLabel>
              <OrganizationStatusSelect
                @selected={{@controller.organizationStatus}}
                @onChange={{@controller.setOrganizationStatus}}
                @allowClear={{true}}
                @id="statuses"
              />
            </div>
            <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
              <AuLabel for="legal-form">Juridische vorm</AuLabel>
              <LegalFormMultipleSelect
                @selected={{@controller.legalFormIds}}
                @onChange={{@controller.setLegalFormIds}}
                @allowClear={{true}}
                @id="legal-form"
              />
            </div>
            <div class="au-o-grid__item au-u-1-2@small au-u-1-1@medium">
              <AuLabel for="vendor">Digitaal platform</AuLabel>
              <VendorSelect
                @selected={{@controller.vendor}}
                @onChange={{@controller.setVendor}}
                @id="vendor"
              />
            </div>
            <div class="au-o-grid__item">
              <AuButton @skin="link" type="reset">
                <AuIcon @icon="cross" @alignment="left" />
                Herstel alle filters
              </AuButton>
            </div>
          </form>
        </div>
      </div>
    </:sidebar>
    <:content>
      <AuDataTable
        @content={{@controller.organizations}}
        @isLoading={{@controller.showTableLoader}}
        @page={{@controller.page}}
        @size={{@controller.size}}
        as |t|
      >
        <t.menu as |menu|>
          <menu.general>
            <PageHeader class="au-o-box">
              <:title>Organisaties</:title>
              <:action>
                <div class="au-u-text-right">
                  {{#if (readOnly)}}
                    <EditsDisabledMessage />
                  {{else}}
                    <SecuredArea>
                      <:edit>
                        <AuLink
                          @route="organizations.new"
                          @icon="add"
                          @iconAlignment="left"
                          @skin="button"
                        >
                          Nieuw
                        </AuLink>
                      </:edit>
                    </SecuredArea>
                  {{/if}}
                </div>
              </:action>
            </PageHeader>
          </menu.general>
        </t.menu>
        <t.content class="au-c-data-table__table--small" as |c|>
          <c.header>
            <AuDataTableThSortable
              @field="name"
              @currentSorting={{@controller.sort}}
              @label="Naam"
            />
            <AuDataTableThSortable
              @field="classification_name"
              @currentSorting={{@controller.sort}}
              @label="Type"
            />
            {{#if @controller.currentSession.hasWorshipRole}}
              <AuDataTableThSortable
                @field="recognized_worship_type_name"
                @currentSorting={{@controller.sort}}
                @label="Soort eredienst"
              />
            {{/if}}
            <AuDataTableThSortable
              @field="province"
              @currentSorting={{@controller.sort}}
              @label="Provincie"
            />
            <AuDataTableThSortable
              @field="municipality"
              @currentSorting={{@controller.sort}}
              @label="Gemeente"
            />
            <AuDataTableThSortable
              @field="status"
              @currentSorting={{@controller.sort}}
              @label="Status"
            />
          </c.header>
          {{#if @controller.hasErrored}}
            <ErrorTableMessage />
          {{else if @controller.hasNoResults}}
            <TableMessage>
              <p>
                Er werden geen zoekresultaten gevonden. Kijk na op spelfouten,
                of probeer een andere zoekopdracht. Indien een organisatie
                ontbreekt, meld dit aan
                <a
                  class="au-c-link"
                  href="mailto:{{config 'contactEmail'}}"
                >{{config "contactEmail"}}</a>
                {{#unless (readOnly)}}
                  of
                  <AuLink @route="organizations.new">maak een organisatie aan.</AuLink>
                {{/unless}}
              </p>
            </TableMessage>
          {{else}}
            <c.body as |organization|>
              <td>
                <AuLink
                  @route={{organization.route}}
                  @model={{organization.id}}
                >
                  {{#if organization.legal_name}}
                    {{organization.legal_name}}
                  {{else}}
                    {{organization.name}}
                  {{/if}}
                </AuLink>
              </td>
              <td>{{organization.classification_name}}</td>
              {{#if @controller.currentSession.hasWorshipRole}}
                <td>{{organization.recognized_worship_type_name}}</td>
              {{/if}}
              <td>{{organization.province}}</td>
              <td>{{organization.municipality}}</td>
              <td>
                {{#if organization.status}}
                  <OrganizationStatus
                    @id={{organization.status_id}}
                    @label={{organization.status}}
                  />
                {{/if}}
              </td>
            </c.body>
          {{/if}}
        </t.content>
      </AuDataTable>
    </:content>
  </SidebarContainer>
</template>
