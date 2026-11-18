import SidebarContainer from '../../components/sidebar-container';
import { on } from '@ember/modifier';
import AuLabel from '@appuniversum/ember-appuniversum/components/au-label';
import TrimInput from '../../components/trim-input';
import OrganizationSelect from '../../components/organization-select';
import or from 'ember-truth-helpers/helpers/or';
import PositionSelect from '../../components/position-select';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import PageHeader from '../../components/page-header';
import SecuredArea from '../../components/secured-area';
import NewButton from '../../components/button/new';
import AuToggleSwitch from '@appuniversum/ember-appuniversum/components/au-toggle-switch';
import { fn, array } from '@ember/helper';
import not from 'ember-truth-helpers/helpers/not';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table-th-sortable';
import ErrorTableMessage from '../../components/table-message/error';
import TableMessage from '../../components/table-message';
import config from 'ember-config-helper/helpers/config';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import eq from 'ember-truth-helpers/helpers/eq';
import gt from 'ember-truth-helpers/helpers/gt';
import PositionStatus from '../../components/position-status';

<template>
  <SidebarContainer>
    <:sidebar>
      <div class="au-c-sidebar">
        <div class="au-c-sidebar__content au-o-box">
          <form
            {{on "reset" @controller.resetFilters}}
            class="au-o-grid au-o-grid--small"
          >
            <p class="au-o-grid__item">
              <AuLabel for="filter-given-name">Voornaam</AuLabel>
              <TrimInput
                @width="block"
                @value={{@controller.given_name}}
                @onUpdate={{@controller.setGivenName}}
                id="filter-given-name"
              />
            </p>
            <p class="au-o-grid__item">
              <AuLabel for="filter-family-name">Achternaam</AuLabel>
              <TrimInput
                @width="block"
                @value={{@controller.family_name}}
                @onUpdate={{@controller.setFamilyName}}
                id="filter-family-name"
              />
            </p>
            <p class="au-o-grid__item">
              <AuLabel for="filter-organization">Organisatie</AuLabel>
              <OrganizationSelect
                @allowClear={{true}}
                @classificationCodes={{@controller.classificationCodes}}
                @selected={{or
                  @controller.selectedOrganization
                  @controller.organization
                }}
                @onChange={{@controller.setOrganization}}
                @selectedPosition={{@controller.position}}
                class="grow"
              />
            </p>
            <div class="au-o-grid__item">
              <AuLabel for="positions">Positie</AuLabel>
              <PositionSelect
                @selected={{@controller.position}}
                @onChange={{@controller.setPosition}}
                @selectedOrganization={{@controller.organization}}
                @id="positions"
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
        @content={{@controller.people}}
        @isLoading={{@controller.showTableLoader}}
        @page={{@controller.page}}
        @size={{@controller.size}}
        as |t|
      >
        <t.menu as |menu|>
          <menu.general>
            <PageHeader class="au-o-box">
              <:title>
                Personen
              </:title>
              <:alert>
                <SecuredArea>
                  <:edit>
                    <NewButton @route="people.new-position" />
                  </:edit>
                </SecuredArea>
              </:alert>
            </PageHeader>
            <div class="au-o-box">
              <AuToggleSwitch
                @checked={{@controller.status}}
                @onChange={{fn
                  (mut @controller.status)
                  (not @controller.status)
                }}
              >
                Verberg niet actieve posities
              </AuToggleSwitch>
            </div>
          </menu.general>
        </t.menu>
        <t.content class="au-c-data-table__table--small" as |c|>
          <c.header>
            <AuDataTableThSortable
              @field="given_name"
              @currentSorting={{@controller.sort}}
              @label="Voornaam"
            />
            <AuDataTableThSortable
              @field="family_name"
              @currentSorting={{@controller.sort}}
              @label="Achternaam"
            />
            <AuDataTableThSortable
              @field="organization_name"
              @currentSorting={{@controller.sort}}
              @label="Organisatie"
            />
            <AuDataTableThSortable
              @field="position_name"
              @currentSorting={{@controller.sort}}
              @label="Positie"
            />
            <th>Status</th>
          </c.header>
          {{#if @controller.hasErrored}}
            <ErrorTableMessage />
          {{else if @controller.hasNoResults}}
            <TableMessage>
              <p>
                Er werden geen zoekresultaten gevonden. Kijk na op spelfouten,
                of probeer een andere zoekopdracht. Indien een persoon
                ontbreekt, meld dit aan
                <a
                  href="mailto:{{config 'contactEmail'}}"
                  class="au-c-link"
                >{{config "contactEmail"}}</a>.
              </p>
            </TableMessage>
          {{else}}
            <c.body as |person|>
              <td>
                <AuLink @route="people.person" @model={{person.id}}>
                  {{person.given_name}}
                </AuLink>
              </td>
              <td>
                <AuLink @route="people.person" @model={{person.id}}>
                  {{person.family_name}}
                </AuLink>
              </td>
              <td>
                {{#each person.organizations as |organization index|}}
                  {{#if organization.id}}
                    <AuLink
                      @route="organizations.organization"
                      @model={{organization.id}}
                    >
                      {{person.organization_name}}
                      {{#if
                        (not
                          (or
                            (eq
                              organization.classification
                              "Centraal bestuur van de eredienst"
                            )
                            (eq
                              organization.classification
                              "Bestuur van de eredienst"
                            )
                          )
                        )
                      }}
                        ({{organization.classification}})
                      {{/if}}
                    </AuLink>
                  {{/if}}
                  {{#if (gt person.organizations.length 1)}}
                    {{unless index "/"}}
                  {{/if}}
                {{/each}}
              </td>
              <td>
                <AuLink
                  @route={{person.positionRoute}}
                  @models={{array person.id person.uuid}}
                >
                  {{person.position_name}}
                </AuLink>
              </td>
              <td>
                <PositionStatus @endDate={{person.end_date}} />
              </td>
            </c.body>
          {{/if}}
        </t.content>
      </AuDataTable>
    </:content>
  </SidebarContainer>
</template>
