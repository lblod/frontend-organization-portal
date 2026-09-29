import AuInput, {
  type AuInputSignature,
} from '@appuniversum/ember-appuniversum/components/au-input';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';

interface Signature {
  Args: {
    value?: string;
    onUpdate: (value: string) => void;
    width?: 'block';
    error?: boolean;
    disabled?: boolean;
    autocomplete?: string;
    id?: string;
  };
  Element: AuInputSignature['Element'];
}

export default class TrimInputComponent extends Component<Signature> {
  @action
  trimInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const input = inputElement.value.trim();

    if (this.args.value !== inputElement.value) {
      this.args.onUpdate(input);
    }
  }

  @action
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.trimInput(event);
    }
  }

  <template>
    <AuInput
      @disabled={{@disabled}}
      @error={{@error}}
      @width={{@width}}
      autocomplete={{@autocomplete}}
      id={{@id}}
      value={{@value}}
      {{on "focusout" this.trimInput}}
      {{on "keydown" this.handleKeydown}}
      ...attributes
    />
  </template>
}
