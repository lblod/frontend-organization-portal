import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import { action } from '@ember/object';
import { fn, get } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import TrimInput from 'frontend-organization-portal/components/trim-input';

interface Signature {
  Args: {
    decision: {
      documentLinks: string[];
      removeError: (propName: string) => void;
    };
    errors?: {
      documentLinks?: Array<{ message: string }>;
    };
  };
}

export default class DecisionDocumentLinks extends Component<Signature> {
  @action
  addLink() {
    this.args.decision.documentLinks = [
      ...this.args.decision.documentLinks,
      '',
    ];
  }

  @action
  updateLink(index: number, value: string) {
    const documentLinks = [...this.args.decision.documentLinks];
    documentLinks[index] = value;
    this.args.decision.documentLinks = documentLinks;
  }

  @action
  removeLink(index: number) {
    this.args.decision.documentLinks = this.args.decision.documentLinks.filter(
      (_, linkIndex) => linkIndex !== index,
    );

    // We clear all errors for this field for now.
    this.args.decision.removeError('documentLinks');
  }

  <template>
    {{#if @decision.documentLinks}}
      <ul class="au-o-flow au-o-flow--small">
        {{#each @decision.documentLinks key="@index" as |documentLink index|}}
          {{#let (get @errors.documentLinks index) as |error|}}
            <li>
              <div class="au-u-flex au-u-flex--vertical-center">
                <TrimInput
                  @value={{documentLink}}
                  @onUpdate={{fn this.updateLink index}}
                  @width="block"
                  @error={{if error true false}}
                  @id="change-event-decision-link-{{index}}"
                  placeholder="https://vlaanderen.be"
                />
                <AuButton
                  @alert={{true}}
                  @skin="naked"
                  @icon="bin"
                  @hideText={{true}}
                  {{on "click" (fn this.removeLink index)}}
                >
                  Verwijder link
                </AuButton>
              </div>
              {{#if error}}
                <AuHelpText @error={{true}}>{{error.message}}</AuHelpText>
              {{/if}}
            </li>
          {{/let}}
        {{/each}}
      </ul>
    {{else}}
      <AuHelpText class="au-u-text-center">
        Nog geen links toegevoegd
      </AuHelpText>
    {{/if}}

    <AuButton
      @skin="secondary"
      @icon="add"
      @width="block"
      class="au-u-margin-top-small"
      type="button"
      {{on "click" this.addLink}}
    >
      Nieuwe link toevoegen
    </AuButton>
  </template>
}
