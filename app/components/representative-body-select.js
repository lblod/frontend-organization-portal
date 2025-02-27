import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { BLACKLIST_RO } from '../models/representative-body';

export default class RepresentativeBodySelectComponent extends Component {
  @service store;
  representativeBodies;

  constructor(...args) {
    super(...args);

    this.representativeBodies = this.loadRepresentativeBodiesTask.perform();
  }

  @task
  *loadRepresentativeBodiesTask() {
    const representativeBodies = yield this.store.findAll(
      'representative-body',
      { include: 'organization-status' },
    );

    const filteredRepresentativeBodies = representativeBodies.filter((body) => {
      return !BLACKLIST_RO.find((item) => item == body.id);
    });

    return filteredRepresentativeBodies;
  }
}
