import Component from '@glimmer/component';
import { service } from '@ember/service';
import AuMainHeader from '@appuniversum/ember-appuniversum/components/au-main-header';
import config from 'ember-config-helper/helpers/config';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import AuLink from '@appuniversum/ember-appuniversum/components/au-link';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import LoginButton from './login-button';

export default class AppHeaderComponent extends Component {
  @service currentSession;
  @service session;

  <template>
    <AuMainHeader
      @brandLink="https://www.vlaanderen.be/nl"
      @homeRoute="index"
      @appTitle={{config "appName"}}
      @contactRoute="contact"
    >
      {{#if this.session.isAuthenticated}}
        <AuDropdown
          @title={{this.currentSession.user.firstName}}
          @buttonLabel="Account settings"
          @alignment="right"
          role="menu"
        >
          <AuLink role="menuitem" @route="select-role">
            <AuIcon @icon="user" @alignment="left" />Wissel van rol
          </AuLink>

          <AuLink @route="auth.logout" @icon="logout" role="menuitem">
            Afmelden
          </AuLink>
        </AuDropdown>
      {{else}}
        <LoginButton @isCompact={{true}} />
      {{/if}}
    </AuMainHeader>
  </template>
}
