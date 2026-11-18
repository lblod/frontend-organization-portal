import StaticPage from 'frontend-organization-portal/components/static-page';
import MockLogin from '@lblod/ember-mock-login/components/mock-login';
import AuLoader from '@appuniversum/ember-appuniversum/components/au-loader';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

<template>
  <StaticPage>
    <div class="au-o-layout au-o-region-large">
      <MockLogin as |login|>
        {{#if login.isLoading}}
          <AuLoader>
            Testgebruikers aan het laden
          </AuLoader>
        {{else}}
          {{#if login.errorMessage}}
            {{login.errorMessage}}
          {{/if}}
          <AuHeading @skin="4" class="au-u-margin-bottom">Kies een testgebruiker</AuHeading>
          <ul>
            {{#each @controller.model.accounts as |account|}}
              <li>
                <div
                  class="au-o-box au-o-box--small au-c-card au-u-margin-bottom-small"
                >
                  <AuButton
                    @skin="link"
                    {{on
                      "click"
                      (fn login.login account.id account.user.group.id)
                    }}
                  >
                    <strong>
                      {{account.user.firstName}}
                      {{account.user.familyName}}
                      -&nbsp;
                    </strong>
                    {{account.user.group.name}}
                  </AuButton>
                </div>
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </MockLogin>
    </div>
  </StaticPage>
</template>
