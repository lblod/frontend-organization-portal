import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import PowerSelect from 'ember-power-select/components/power-select';
import { legalFormsQuery } from 'frontend-organization-portal/builders/concepts';

export default class LegalFormSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadLegalFormsTask.perform();
  }

  get selectedLegalForm() {
    if (typeof this.args.selected === 'string') {
      return this.findLegalFormById(this.args.selected);
    }

    return this.args.selected;
  }

  findLegalFormById(id) {
    if (this.loadLegalFormsTask.isRunning) {
      return null;
    }

    let legalForms = this.loadLegalFormsTask.last.value;
    return legalForms.find((legalForm) => legalForm.id === id);
  }

  loadLegalFormsTask = task(async () => {
    const { content } = await this.store.request(legalFormsQuery());

    return content;
  });

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @allowClear={{@allowClear}}
        @loadingMessage="Aan het laden..."
        @noMatchesMessage="Geen resultaten"
        @searchMessage="Typ om te zoeken"
        @searchEnabled={{true}}
        @searchField="label"
        @options={{this.loadLegalFormsTask.last}}
        @selected={{this.selectedLegalForm}}
        @onChange={{@onChange}}
        @disabled={{@disabled}}
        @triggerId={{@id}}
        as |legalForm|
      >
        {{legalForm.label}}
      </PowerSelect>
    </div>
  </template>
}
