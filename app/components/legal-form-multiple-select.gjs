import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import PowerSelect from 'ember-power-select/components/power-select';
import { legalFormsQuery } from 'frontend-organization-portal/builders/concepts';

export default class LegalFormMultipleSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadLegalFormsTask.perform();
  }

  loadLegalFormsTask = task(async () => {
    const { content } = await this.store.request(legalFormsQuery());

    return content;
  });

  get selectedLegalForms() {
    let selection = [];

    if (typeof this.args.selected === 'string' && this.args.selected.length) {
      const ids = this.args.selected.split(',');
      ids.forEach((id) => {
        const legalForm = this.findLegalFormById(id);
        if (legalForm) {
          selection.push(legalForm);
        }
      });
    }

    return selection;
  }

  findLegalFormById(id) {
    if (this.loadLegalFormsTask.isRunning) {
      return null;
    }

    let legalForms = this.loadLegalFormsTask.last.value;
    return legalForms.find((legalForm) => legalForm.id === id);
  }

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @multiple={{true}}
        @allowClear={{@allowClear}}
        @searchEnabled={{true}}
        @searchField="label"
        @loadingMessage="Aan het laden..."
        @noMatchesMessage="Geen resultaten"
        @searchMessage="Typ om te zoeken"
        @closeOnSelect={{false}}
        @options={{this.loadLegalFormsTask.last}}
        @selected={{this.selectedLegalForms}}
        @onChange={{@onChange}}
        @triggerId={{@id}}
        as |legalForm|
      >
        {{legalForm.label}}
      </PowerSelect>
    </div>
  </template>
}
