import pageTitle from 'ember-page-title/helpers/page-title';
import breadcrumb from 'ember-breadcrumb-trail/helpers/breadcrumb';
import AuBodyContainer from '@appuniversum/ember-appuniversum/components/au-body-container';
import PageHeader from 'frontend-organization-portal/components/page-header';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';

<template>
  {{pageTitle "Nieuwe positie"}}
  {{breadcrumb "Nieuwe positie" route="people.new"}}

  <AuBodyContainer @scroll={{true}}>
    <div class="au-o-box au-o-flow au-o-flow--large">
      <PageHeader>
        <:title>Nieuwe positie</:title>
        <:action>
          <AuButtonGroup class="au-c-button-group--align-right">
            <AuLink @route="people" @skin="button-secondary">
              Annuleer
            </AuLink>
            <AuButton form="person-creation" type="submit" @disabled={{true}}>
              Volgende
            </AuButton>
          </AuButtonGroup>
        </:action>
      </PageHeader>
      <div>
        Op dit moment kan je geen nieuwe personen aanmaken. De posities van
        mandatarissen, bestuursleden en bedienaren (voor erediensten) worden
        automatisch ge-update door de bestuurseenheden zelf. Merk je dat een
        positie of persoon niet wordt vermeld of de data is verkeerd, meld dit
        via onze
        <a
          href="https://binnenland.atlassian.net/servicedesk/customer/portal/13"
          class="au-c-link"
        >helpdesk</a>. We verzoeken dan de besturen om deze data aan te passen.
        Samen houden we het OrganisatiePortaal up-to-date!
      </div>
    </div>
  </AuBodyContainer>
</template>
