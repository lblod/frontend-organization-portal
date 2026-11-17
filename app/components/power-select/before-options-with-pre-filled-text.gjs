/* eslint-disable ember/no-runloop */
// TODO: remove runloop usage.
import Component from '@glimmer/component';
import { scheduleOnce, later } from '@ember/runloop';
import { action } from '@ember/object';

export default class BeforeOptionsWithPreFilledText extends Component {
  @action
  clearSearch() {
    scheduleOnce('actions', this.args.select.actions, 'search', '');
  }

  @action
  handleKeydown(e) {
    if (this.args.onKeydown(e) === false) {
      return false;
    }
    if (e.keyCode === 13) {
      this.args.select.actions.close(e);
    }
  }

  @action
  focusInput(el) {
    later(() => {
      if (this.args.autofocus !== false) {
        el.focus();
      }
    }, 0);
  }
}

{{#if @searchEnabled}}
  <div class="ember-power-select-search">
    <input
      type="search"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck={{false}}
      class="ember-power-select-movable-cursor"
      value={{@addressSuggestion.fullAddress}}
      aria-label="Search text input"
      aria-activedescendant={{@ariaActiveDescendant}}
      aria-controls={{@listboxId}}
      aria-haspopup="listbox"
      placeholder={{@searchPlaceholder}}
      {{on "input" @onInput}}
      {{on "focus" @onFocus}}
      {{on "blur" @onBlur}}
      {{on "keydown" this.handleKeydown}}
      {{! template-lint-disable no-at-ember-render-modifiers}}
      {{!TODO: replace with a custom focus modifier and the willDestroy method}}
      {{did-insert this.focusInput}}
      {{will-destroy this.clearSearch}}
    />
  </div>
{{/if}}