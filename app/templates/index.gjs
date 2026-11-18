import SidebarContainer from 'frontend-organization-portal/components/sidebar-container';
import AuNavigationLink from '@appuniversum/ember-appuniversum/components/au-navigation-link';
import config from 'ember-config-helper/helpers/config';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import appVersion from 'ember-cli-app-version/_app_/helpers/app-version.js';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuContent from '@appuniversum/ember-appuniversum/components/au-content';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

<template>
  <SidebarContainer>
    <:sidebar>
      <div class="au-c-sidebar">
        <div class="au-c-sidebar__content">
          <div class="au-c-sidebar__header">
            <h6 class="au-u-h6 au-u-medium">Menu modules</h6>
          </div>
          <ul class="au-c-list-navigation">
            <li class="au-c-list-navigation__item">
              <AuNavigationLink @route="organizations">
                Organisaties
              </AuNavigationLink>
            </li>
            <li class="au-c-list-navigation__item">
              <AuNavigationLink @route="people">
                Personen
              </AuNavigationLink>
            </li>
          </ul>
        </div>
        <div class="au-c-sidebar__footer">
          <a
            href={{config "userManual.general"}}
            class="au-c-link au-c-link--secondary au-c-link--icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AuIcon @icon="manual" @alignment="left" />
            Handleiding (externe link)
          </a>
          <AuHelpText @skin="secondary">
            {{config "appName"}}
            {{#if (config "showAppVersionHash")}}
              (<a
                class="au-c-link"
                href="https://github.com/lblod/frontend-organization-portal/commit/{{appVersion
                  shaOnly=true
                }}"
              >{{appVersion shaOnly=true}}</a>)
            {{else}}
              v{{appVersion versionOnly=true}}
            {{/if}}
          </AuHelpText>
        </div>
      </div>
    </:sidebar>
    <:content>
      <div class="au-o-box">
        <AuHeading @skin="2" class="au-u-margin-bottom-large">
          {{@controller.currentSession.user.fullName}}
        </AuHeading>

        <AuHeading @level="2" @skin="3" class="au-u-margin-bottom">
          Beschikbare modules
        </AuHeading>

        <ul class="au-o-grid au-o-grid">
          <li class="au-o-grid__item au-u-1-2@medium au-u-2-5@large">
            <AuCard @flex={{true}} as |c|>
              <c.header @badgeSkin="brand" @badgeIcon="sitemap">
                <AuHeading @level="3" @skin="4">
                  Organisaties
                </AuHeading>
              </c.header>
              <c.content>
                <AuContent>
                  <ul>
                    <li>
                      Kerninformatie over organisaties
                    </li>
                    <li>
                      Bestuursorganen en mandaten
                    </li>
                    <li>
                      Gerelateerde organisaties
                    </li>
                  </ul>
                </AuContent>
              </c.content>
              <c.footer>
                <AuButtonGroup class="au-c-button-group--wrap">
                  <AuButton
                    {{on "click" (fn @controller.goToContext "organizations")}}
                  >
                    Ga naar organisaties
                  </AuButton>
                  <a
                    href={{config "userManual.module.organizations"}}
                    class="au-c-button au-c-button--link-secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <AuIcon @icon="manual" @alignment="left" />
                    Handleiding (externe link)
                  </a>
                </AuButtonGroup>
              </c.footer>
            </AuCard>
          </li>
          <li class="au-o-grid__item au-u-1-2@medium au-u-2-5@large">
            <AuCard @flex={{true}} as |c|>
              <c.header @badgeSkin="brand" @badgeIcon="users">
                <AuHeading @level="2" @skin="4">
                  Personen
                </AuHeading>
              </c.header>
              <c.content>
                <AuContent>
                  <ul>
                    <li>
                      Persoonlijke informatie over personen
                    </li>
                    <li>
                      Contactinformatie
                    </li>
                    <li>
                      Posities
                    </li>
                  </ul>

                </AuContent>
              </c.content>
              <c.footer>
                <AuButtonGroup class="au-c-button-group--wrap">
                  <AuButton
                    {{on "click" (fn @controller.goToContext "people")}}
                  >
                    Ga naar personen
                  </AuButton>
                  <a
                    href={{config "userManual.module.people"}}
                    class="au-c-button au-c-button--link-secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <AuIcon @icon="manual" @alignment="left" />
                    Handleiding (externe link)
                  </a>
                </AuButtonGroup>
              </c.footer>
            </AuCard>
          </li>
        </ul>
      </div>
    </:content>
  </SidebarContainer>
</template>
