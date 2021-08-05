import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class RepresentativeBodySelectComponent extends Component {
  @service store;
  representativeBodies;

  constructor(...args) {
    super(...args);

    this.representativeBodies = this.loadRepresentativeBodiesTask.perform();
  }

  @task
  *loadRepresentativeBodiesTask() {
    return yield this.store.findAll('representative-body');
  }
}
