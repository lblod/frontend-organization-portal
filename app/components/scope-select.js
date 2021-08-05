import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class ScopeSelectComponent extends Component {
  @service store;
  scopes;

  constructor(...args) {
    super(...args);

    this.scopes = this.loadScopesTask.perform();
  }

  @restartableTask
  *loadScopesTask(searchParams = '') {
    const query = {
      sort: 'label',
    };

    if (searchParams.length > 1) {
      query['filter[label]'] = searchParams;
    }
    return yield this.store.query('location', query);
  }
}
