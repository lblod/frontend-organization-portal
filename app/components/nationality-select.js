import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class NationalitySelectComponent extends Component {
  @service store;

  @restartableTask
  *searchNationalitiesTask(search = '') {
    yield timeout(500);

    const query = {
      sort: 'label',
    };

    if (search.trim() !== '') {
      query['filter[label]'] = search;
    }

    return yield this.store.query('nationality', query);
  }
}
