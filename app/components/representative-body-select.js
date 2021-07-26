import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class RepresentativeBodySelectComponent extends Component {
  @service fastboot;
  @service store;
  representativeBodies;

  constructor(...args) {
    super(...args);

    if (!this.fastboot.isFastBoot) {
      this.representativeBodies = this.loadRepresentativeBodiesTask.perform();
    }
  }

  @task
  *loadRepresentativeBodiesTask() {
    return yield this.store.findAll('representative-body');
  }
}
