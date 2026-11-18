import Component from '@glimmer/component';
import { service } from '@ember/service';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';

export default class EditsDisabledMessageComponent extends Component {
  @service rvsOrganizationEdits;

  get isShown() {
    return this.rvsOrganizationEdits.isReadOnly;
  }

  <template>
    {{#if this.isShown}}
      {{! Not an `AuAlert`: it renders `role="alert"`, which makes the text
          unselectable and announces the notice on every page load. }}
      <div class="au-c-alert au-c-alert--small">
        <div class="au-c-alert__content">
          <div class="au-c-alert__message">
            Bewerken kan niet meer in het OrganisatiePortaal. Het beheer gebeurt
            nu in de
            <AuLinkExternal
              href="https://lokaleverkenner.lokaalbestuur.vlaanderen.be"
            >
              Lokale Verkenner
            </AuLinkExternal>. Voor meer informatie, contacteer onze
            <AuLinkExternal href="mailto:LoketLokaalBestuur@vlaanderen.be">
              helpdesk
            </AuLinkExternal>.
          </div>
        </div>
      </div>
    {{/if}}
  </template>
}
