import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

const LEGAL_FORM_SCHEME_ID = 'c3ff1a7f-c091-484d-8785-c8a5740573af';

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

  @task *loadLegalFormsTask() {
    return yield this.store.query('concept', {
      sort: 'order',
      'page[size]': 30,
      'filter[in-scheme][:id:]': LEGAL_FORM_SCHEME_ID,
      include: 'in-scheme',
    });
  }
}
