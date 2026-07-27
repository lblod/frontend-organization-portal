import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class WorshipServiceMultipleSelectComponent extends Component {
  @service store;

  loadWorshipServicesTask = restartableTask(async (searchParams = '') => {
    await timeout(500);

    const query = {
      sort: 'name',
    };

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    return await this.store.query('worship-service', query);
  });
}
