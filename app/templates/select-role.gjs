import StaticPage from '../components/static-page';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import convertRoleNames from '../helpers/convert-role-names';

<template>
  <StaticPage>
    <div class="au-o-layout au-o-region-large">

      <AuHeading @skin="4" class="au-u-margin-bottom">Kies een rol</AuHeading>
      {{#if @controller.model.roles}}
        <ul>
          {{#each @controller.model.roles as |role|}}
            <li>
              <div
                class="au-o-box au-o-box--small au-c-card au-u-margin-bottom-small"
              >
                <AuButton
                  @skin="link"
                  {{on "click" (fn @controller.updateActiveRole role)}}
                >
                  <strong>
                    {{convertRoleNames role}}
                  </strong>
                </AuButton>
              </div>
            </li>
          {{/each}}
        </ul>
      {{/if}}
    </div>
  </StaticPage>
</template>
