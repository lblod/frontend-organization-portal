import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class RecognizedWorshipTypeSelect extends Component {
  @service store;
  recognizedWorshipTypes;

  constructor(...args) {
    super(...args);

    this.recognizedWorshipTypes = this.loadRecognizedWorshipTypesTask.perform();
  }

  @task
  *loadRecognizedWorshipTypesTask() {
    return yield this.store.findAll('recognized-worship-type');
  }
}
