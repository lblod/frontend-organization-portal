import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import PowerSelect from 'ember-power-select/components/power-select';
import { contentThemesQuery } from 'frontend-organization-portal/builders/concepts';

export default class ContentThemeSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadContentThemesTask.perform();
  }

  get selectedContentThemes() {
    let selection = this.args.selected;

    if (typeof selection === 'string' && selection.length) {
      selection = selection
        .split(',')
        .map((id) => this.findContentThemeById(id))
        .filter(Boolean);
    }

    return selection;
  }

  findContentThemeById(id) {
    if (this.loadContentThemesTask.isRunning) {
      return null;
    }

    let contentThemes = this.loadContentThemesTask.last.value;
    return contentThemes.find((contentTheme) => contentTheme.id === id);
  }

  loadContentThemesTask = task(async () => {
    const { content } = await this.store.request(contentThemesQuery());

    return content;
  });

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @multiple={{true}}
        @loadingMessage="Aan het laden..."
        @noMatchesMessage="Geen resultaten"
        @searchEnabled={{true}}
        @searchField="label"
        @closeOnSelect={{false}}
        @options={{this.loadContentThemesTask.last}}
        @selected={{this.selectedContentThemes}}
        @onChange={{@onChange}}
        @triggerId={{@id}}
        as |contentTheme|
      >
        {{contentTheme.label}}
      </PowerSelect>
    </div>
  </template>
}
