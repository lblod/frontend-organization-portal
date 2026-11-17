import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';

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

    const { content } = await this.store.request(
      queryBuilder('worship-service', query),
    );

    return content;
  });
}
