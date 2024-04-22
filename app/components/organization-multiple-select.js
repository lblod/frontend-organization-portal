import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class OrganizationMultipleSelectComponent extends Component {
  @service store;

  @restartableTask
  *loadOrganizationsMultipleTask(searchParams = '') {
    yield timeout(500);

    const query = {
      sort: 'name',
    };

    let classificationCodes = this.args.classificationCodes;
    if (classificationCodes.length) {
      query.filter = {
        classification: {
          ':id:': classificationCodes.join(),
        },
      };
    }

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    return yield this.store.query('organization', query);
  }
}
