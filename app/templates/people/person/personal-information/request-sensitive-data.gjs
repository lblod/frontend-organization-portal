import PageHeader from '../../../../components/page-header';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import not from 'ember-truth-helpers/helpers/not';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import EditCard from '../../../../components/edit-card';
import PowerSelect from 'ember-power-select/components/power-select';
import { fn } from '@ember/helper';

<template>
  <div class="au-c-body-container au-c-body-container--scroll">
    <div class="au-o-box au-o-flow au-o-flow--large">
      <PageHeader>
        <:title>Consulteer persoonlijke gegevens</:title>
        <:subtitle>
          {{@model.person.givenName}}
          {{@model.person.familyName}}
        </:subtitle>
        <:action>
          <AuButton @skin="secondary" {{on "click" @controller.cancel}}>
            Annuleer
          </AuButton>
          <AuButton
            form="request-sensitive-information"
            type="submit"
            @disabled={{not @controller.reasonCode}}
          >
            Volgende
          </AuButton>
        </:action>
      </PageHeader>

      <AuHelpText>
        Ter bescherming van de privacy, conform de GDPR regelgeving, dient u een
        reden in te geven waarom u deze gegevens wenst te consulteren op te
        bewerken. De opgegeven reden (audit trail) wordt bewaard en kan
        onderzocht worden in het geval van onrechtmatig gebruik.
      </AuHelpText>

      <form
        id="request-sensitive-information"
        {{on "submit" @controller.submit}}
      >
        <EditCard @containsRequiredFields={{true}}>
          <:title>Reden</:title>
          <:card as |Card|>
            <Card.Columns>
              <:left as |Item|>
                <Item @labelFor="reason" @required={{true}}>
                  <:label>Reden</:label>
                  <:content>
                    <PowerSelect
                      @allowClear={{true}}
                      @searchEnabled={{false}}
                      @loadingMessage="Aan het laden..."
                      @searchField="label"
                      @selected={{@controller.reasonCode}}
                      @options={{@controller.loadReasonCodes.last}}
                      @onChange={{fn (mut @controller.reasonCode)}}
                      @triggerId={{@id}}
                      as |reasonCode|
                    >
                      {{reasonCode.label}}
                    </PowerSelect>
                  </:content>
                </Item>
              </:left>
            </Card.Columns>
          </:card>
        </EditCard>
      </form>
    </div>
  </div>
</template>
