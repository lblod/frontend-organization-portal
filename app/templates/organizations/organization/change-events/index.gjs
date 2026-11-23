import AuDataTable from '@appuniversum/ember-appuniversum/components/au-data-table';
import AuDataTableThSortable from '@appuniversum/ember-appuniversum/components/au-data-table-th-sortable';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuTooltip from '@appuniversum/ember-appuniversum/components/au-tooltip';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { Await } from '@warp-drive/ember';
import AdditionalQualificationsList from 'frontend-organization-portal/components/additional-qualifications-list';
import NewButton from 'frontend-organization-portal/components/button/new';
import EditsDisabledMessage from 'frontend-organization-portal/components/edits-disabled-message';
import OrganizationStatus from 'frontend-organization-portal/components/organization-status';
import PageHeader from 'frontend-organization-portal/components/page-header';
import ReportWrongData from 'frontend-organization-portal/components/report-wrong-data';
import SecuredArea from 'frontend-organization-portal/components/secured-area';
import belongsToValue from 'frontend-organization-portal/helpers/belongs-to-value';
import dateFormat from 'frontend-organization-portal/helpers/date-format';
import hasManyValue from 'frontend-organization-portal/helpers/has-many-value';
import isAdditionalQualificationChangeEvent from 'frontend-organization-portal/helpers/is-additional-qualification-change-event';
import readOnly from 'frontend-organization-portal/helpers/read-only';
import {
  CHANGE_EVENT_TYPE,
  isNameChangeType,
} from 'frontend-organization-portal/models/change-event-type';

<template>
  <PageHeader class="au-o-box">
    <:title>Veranderingsgebeurtenissen</:title>
    <:subtitle>{{@model.organization.abbName}}
      ({{@model.organization.classification.label}})</:subtitle>
    <:action>
      <div class="au-u-text-right">
        {{#if (readOnly)}}
          <EditsDisabledMessage />
          <ReportWrongData />
        {{else}}
          <SecuredArea>
            <:edit>
              <NewButton
                @route="organizations.organization.change-events.new"
              />
            </:edit>
            <:readOnly>
              <ReportWrongData />
            </:readOnly>
          </SecuredArea>
        {{/if}}
      </div>
    </:action>
  </PageHeader>

  <AuDataTable
    @content={{@model.changeEventResults}}
    @noDataMessage="Geen veranderingsgebeurtenissen"
    @isLoading={{@controller.showTableLoader}}
    @page={{@controller.page}}
    @size={{@controller.size}}
    as |t|
  >
    <t.content as |c|>
      <c.header>
        <AuDataTableThSortable
          @field="result-from.type.label"
          @currentSorting={{@controller.sort}}
          @label="Type veranderingsgebeurtenis"
        />
        <AuDataTableThSortable
          @field="result-from.date"
          @currentSorting={{@controller.sort}}
          @label="Datum veranderingsgebeurtenis"
        />
        <th>Nieuwe waarde(n)</th>
        <th>Vorige waarde(n)</th>
        <AuDataTableThSortable
          @field="status.label"
          @currentSorting={{@controller.sort}}
          @label="Resulterende status organisatie"
        />
        {{#unless (readOnly)}}
          <SecuredArea>
            <:edit>
              <th></th>
            </:edit>
          </SecuredArea>
        {{/unless}}
      </c.header>
      <c.body as |changeEventResult|>
        {{#let
          (belongsToValue changeEventResult "resultFrom")
          as |changeEvent|
        }}
          <td>
            <AuLink
              @route="organizations.organization.change-events.details"
              @model={{changeEvent.id}}
            >
              {{changeEvent.type.label}}
            </AuLink>
          </td>
          <td>
            {{dateFormat changeEvent.date}}
          </td>
          <ChangeEventValues
            @result={{changeEventResult}}
            @changeEvent={{changeEvent}}
          />
          <td>
            <OrganizationStatus
              @id={{changeEventResult.status.id}}
              @label={{changeEventResult.status.label}}
            />
          </td>
          {{#unless (readOnly)}}
            <SecuredArea>
              <:edit>
                <td>
                  <AuLink
                    @route="organizations.organization.change-events.details.edit"
                    @model={{changeEvent.id}}
                  >
                    Bewerk
                  </AuLink>
                </td>
              </:edit>
            </SecuredArea>
          {{/unless}}
        {{/let}}
      </c.body>
    </t.content>
  </AuDataTable>
</template>

const ChangeEventValues = <template>
  {{#if @changeEvent.isWerkingsgebiedChangeEvent}}
    <WerkingsgebiedChangeEventValues @result={{@result}} />
  {{else if (isAdditionalQualificationChangeEvent @changeEvent)}}
    <AdditionalQualificationChangeEventValues @result={{@result}} />
  {{else if @changeEvent.isLegalFormChangeEvent}}
    <LegalFormChangeEventValues @result={{@result}} />
  {{else if (isNameChangeType @changeEvent.type)}}
    <NameChangeEventValues @result={{@result}} />
  {{else if @changeEvent.isMergerChangeEvent}}
    <MergerChangeEventValues
      @result={{@result}}
      @changeEvent={{@changeEvent}}
    />
  {{else if @changeEvent.isCityChangeEvent}}
    <td>Stadstitel</td>
    <td></td>
  {{else if (isOntbondenEnVereffendChangeEvent @changeEvent)}}
    <td>status Niet Actief</td>
    <td>status Actief</td>
  {{else if (isInVereffeningChangeEvent @changeEvent)}}
    <td>status Actief</td>
    <td>status Actief</td>
  {{else if (isInOntbindingChangeEvent @changeEvent)}}
    <td>status Actief</td>
    <td>status Actief</td>
  {{else if (isOprichtingChangeEvent @changeEvent)}}
    <td>status Actief</td>
    <td></td>
  {{else}}
    {{! Use empty cells as a fallback in case a change event type isn't supported (yet) }}
    <td></td>
    <td></td>
  {{/if}}
</template>;

const WerkingsgebiedChangeEventValues = <template>
  <td>
    <ScopeLabel @location={{@result.resultingScope}} />
  </td>
  <td>
    <ScopeLabel @location={{@result.originalScope}} />
  </td>
</template>;

/**
 * Renders the label for a werkingsgebied (scope of operation) location.
 * The label is resolved via the scope-of-operation backend service, hence
 * the <Await> wrapper.
 */
class ScopeLabel extends Component {
  @service scopeOfOperation;

  @cached
  get labelPromise() {
    return this.args.location
      ? this.scopeOfOperation.getLabelForLocation(this.args.location)
      : Promise.resolve(null);
  }

  <template>
    <Await @promise={{this.labelPromise}}>
      <:pending>
        <AuLoader
          @hideMessage={{true}}
          @inline={{true}}
          @centered={{false}}
        >Werkingsgebied aan het laden</AuLoader>
      </:pending>
      <:error></:error>
      <:success as |label|>
        <AuTooltip as |tooltip|>
          <div class="au-u-max-width-tiny u-truncate" {{tooltip.target}}>
            {{label}}
          </div>

          <tooltip.Content>
            {{label}}
          </tooltip.Content>
        </AuTooltip>
      </:success>
    </Await>
  </template>
}

const AdditionalQualificationChangeEventValues = <template>
  <td>
    {{#if @result.resultingAdditionalQualifications.length}}
      <AdditionalQualificationsList
        @qualifications={{@result.resultingAdditionalQualifications}}
      />
    {{/if}}
  </td>
  <td>
    {{#if @result.originalAdditionalQualifications.length}}
      <AdditionalQualificationsList
        @qualifications={{@result.originalAdditionalQualifications}}
      />
    {{/if}}
  </td>
</template>;

const LegalFormChangeEventValues = <template>
  <td>
    {{@result.resultingLegalForm.label}}
  </td>
  <td>
    {{@result.originalLegalForm.label}}
  </td>
</template>;

const NameChangeEventValues = <template>
  <td>
    {{@result.resultingName}}
  </td>
  <td>
    {{@result.originalName}}
  </td>
</template>;

/**
 * For a merger, the old values are the original organizations (all "Actief"
 * before the merger) and the new values are the union of the original and
 * resulting organizations: absorbed originals become "Niet Actief", the
 * surviving/new resulting organization stays "Actief". Per-organization
 * statuses are not snapshotted on the change event, so we don't read the
 * live `organization.status` (which would drift, e.g. once organizations
 * are later dissolved).
 * The relationships were loaded via the route's `include`, so we can read
 * them synchronously with the hasManyValue helper.
 */
const MergerChangeEventValues = <template>
  {{#let
    (hasManyValue @changeEvent "resultingOrganizations")
    as |resultingOrganizations|
  }}
    <td>
      <MergerOrganizationList
        @organizations={{uniqueOrganizations
          (hasManyValue @changeEvent "originalOrganizations")
          resultingOrganizations
        }}
        @activeOrganizations={{resultingOrganizations}}
      />
    </td>
    <td>
      <MergerOrganizationList
        @organizations={{hasManyValue @changeEvent "originalOrganizations"}}
        @isOriginal={{true}}
      />
    </td>
  {{/let}}
</template>;

const MergerOrganizationList = <template>
  <AuList as |Item|>
    {{#each @organizations as |organization|}}
      <Item>
        {{organization.abbName}}
        ({{mergerOrganizationStatus
          organization
          @activeOrganizations
          @isOriginal
        }})
      </Item>
    {{/each}}
  </AuList>
</template>;

function uniqueOrganizations(...lists) {
  const seen = new Set();
  return lists.flat().filter((organization) => {
    if (!organization || seen.has(organization.id)) return false;
    seen.add(organization.id);
    return true;
  });
}

function mergerOrganizationStatus(
  organization,
  activeOrganizations,
  isOriginal,
) {
  if (isOriginal) return 'Actief';
  return activeOrganizations?.some((active) => active.id === organization.id)
    ? 'Actief'
    : 'Niet Actief';
}

function isOntbondenEnVereffendChangeEvent(changeEvent) {
  return changeEvent?.type?.id === CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND;
}

function isInVereffeningChangeEvent(changeEvent) {
  return changeEvent?.type?.id === CHANGE_EVENT_TYPE.IN_VEREFFENING;
}

function isInOntbindingChangeEvent(changeEvent) {
  return changeEvent?.type?.id === CHANGE_EVENT_TYPE.IN_ONTBINDING;
}

function isOprichtingChangeEvent(changeEvent) {
  return changeEvent?.type?.id === CHANGE_EVENT_TYPE.OPRICHTING;
}
