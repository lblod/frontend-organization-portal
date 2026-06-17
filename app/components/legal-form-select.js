import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

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
    return yield this.store.findAll('legal-form-code');
  }
}
