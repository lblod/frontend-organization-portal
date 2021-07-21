import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class ScopeSelectComponent extends Component {
  @service fastboot;
  @service store;
  scopes;

  constructor(...args) {
    super(...args);

    if (!this.fastboot.isFastBoot) {
      this.scopes = this.loadScopesTask.perform();
    }
  }

  @restartableTask
  *loadScopesTask() {
    const query = {
      page: {
        size: 600,
      },
      sort: 'label',
    };

    return yield this.store.query('location', query);
  }
}
