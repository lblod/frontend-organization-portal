import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class RecognizedWorshipTypeSelect extends Component {
  @service store;

  constructor(...args) {
    super(...args);

    this.loadRecognizedWorshipTypesTask.perform();
  }

  get selectedRecognizedWorshipType() {
    if (typeof this.args.selected === 'string') {
      return this.getRecognizedWorshipTypeById(this.args.selected);
    }

    return this.args.selected;
  }

  getRecognizedWorshipTypeById(id) {
    if (this.loadRecognizedWorshipTypesTask.isRunning) {
      return null;
    }

    let recognizedWorshipTypes = this.loadRecognizedWorshipTypesTask.last.value;
    return recognizedWorshipTypes.find((worshipType) => worshipType.id === id);
  }

  @task
  *loadRecognizedWorshipTypesTask() {
    return yield this.store.findAll('recognized-worship-type');
  }
}
