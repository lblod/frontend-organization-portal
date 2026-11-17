import pageTitle from 'ember-page-title/helpers/page-title';
import { concat } from '@ember/helper';
import AuModalContainer from '@appuniversum/ember-appuniversum/components/au-modal-container';
import BasicDropdownWormhole from 'ember-basic-dropdown/components/basic-dropdown-wormhole';
import AuApp from '@appuniversum/ember-appuniversum/components/au-app';
import EnvironmentBanner from '@lblod/ember-environment-banner/components/environment-banner';
import AppHeader from '../components/app-header';
import eq from 'ember-truth-helpers/helpers/eq';
import config from 'ember-config-helper/helpers/config';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';

<template>
  {{pageTitle
    (concat
      "OrganisatiePortaal"
      (if
        @controller.showEnvironment (concat " - " @controller.environmentName)
      )
    )
  }}

  <AuModalContainer />
  <BasicDropdownWormhole />

  <AuApp class="{{if @controller.showEnvironment 'au-c-app--environment'}}">
    {{#if @controller.showEnvironment}}
      <EnvironmentBanner
        @applicationName="OrganisatiePortaal"
        @environmentName={{@controller.environmentName}}
        @skin={{@controller.environmentInfo.skin}}
        @message="Dit is de <strong>{{@controller.environmentInfo.title}}</strong> van het Organisatie Portaal met fictieve en testgegevens. De productieomgeving met de echte data vind je op <a href=&quot;https://organisaties.abb.vlaanderen.be&quot; title=&quot;Organisatie Portaal&quot; rel=&quot;tag&quot;>https://organisaties.abb.vlaanderen.be</a>."
      />
    {{/if}}
    <AppHeader />
    {{#if (eq "true" (config "announce.maintenance.enabled"))}}
      <AuAlert
        @skin="warning"
        @icon="alert-triangle"
        class="au-u-margin-bottom-none au-c-env-announcement"
      >
        <p>{{config "announce.maintenance.message"}}</p>
      </AuAlert>
    {{else if (eq "true" (config "announce.newDeployment.enabled"))}}
      <AuAlert
        @skin="warning"
        @icon="alert-triangle"
        class="au-u-margin-bottom-none au-c-env-announcement"
      >
        <p>{{config "announce.newDeployment.message"}}</p>
      </AuAlert>
    {{else if (eq "true" (config "announce.testing.enabled"))}}
      <AuAlert
        @skin="warning"
        @icon="alert-triangle"
        class="au-u-margin-bottom-none au-c-env-announcement"
      >
        <p>{{config "announce.testing.message"}}</p>
      </AuAlert>
    {{/if}}
    <main id="main" class="au-c-main-container">
      <div
        class="au-c-main-container__content au-c-main-container__content--scroll"
        id="content"
        tabindex="-1"
      >
        {{outlet}}
      </div>
    </main>
  </AuApp>
</template>
