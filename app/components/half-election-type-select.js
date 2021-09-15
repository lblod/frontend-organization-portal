import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class HalfElectionTypeSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadHalfElectionTypesTask.perform();
  }

  @task *loadHalfElectionTypesTask() {
    return yield this.store.findAll('half-election');
  }
}
