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
      error?: Record<string, { message: string }>;
      removeError: (propName: string) => void;
    };
    errors?: Record<string, { message: string }>;
  };
}

export default class DecisionDocumentLinks extends Component<Signature> {
  @action
  updateLink(index: number, value: string) {
    const documentLinks = [...this.args.decision.documentLinks];
    documentLinks[index] = value;
    this.args.decision.documentLinks = documentLinks;
  }

  @action
  addLink() {
    this.args.decision.documentLinks = [
      ...this.args.decision.documentLinks,
      '',
    ];
  }

  @action
  removeLink(index: number) {
    this.args.decision.documentLinks = this.args.decision.documentLinks.filter(
      (_, linkIndex) => linkIndex !== index,
    );

    for (const propName of Object.keys(this.args.decision.error ?? {})) {
      if (/^\d+$/.test(propName)) {
        this.args.decision.removeError(propName);
      }
    }
  }

  <template>
    {{#each @decision.documentLinks key="@index" as |documentLink index|}}
      {{#let (get @errors index) as |error|}}
        <div class="au-u-flex au-u-flex--vertical-center">
          <TrimInput
            @value={{documentLink}}
            @onUpdate={{fn this.updateLink index}}
            @width="block"
            @error={{if error true false}}
            @id="change-event-decision-link-{{index}}"
          />
          <AuButton
            @alert={{true}}
            @skin="link"
            @icon="bin"
            @hideText={{true}}
            @size="large"
            type="button"
            {{on "click" (fn this.removeLink index)}}
          >
            Verwijder link
          </AuButton>
        </div>
        {{#if error}}
          <AuHelpText @error={{true}}>{{error.message}}</AuHelpText>
        {{/if}}
      {{/let}}
    {{/each}}

    <AuButton
      @skin="link"
      @icon="add"
      type="button"
      {{on "click" this.addLink}}
    >
      Nieuwe link toevoegen
    </AuButton>
  </template>
}
