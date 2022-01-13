import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

export default class AdministrativeUnitSelectComponent extends Component {
  @service store;

  @restartableTask
  *loadAdministrativeUnitsTask(searchParams = '') {
    yield timeout(500);

    const query = {
      sort: 'name',
      include: 'classification',
    };

    if (Array.isArray(this.args.classificationCodes)) {
      query.filter = {
        classification: {
          ':id:': this.args.classificationCodes.join(),
        },
      };
    }

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    let searchResults = yield this.store.query('administrative-unit', query);
    if (typeof this.args.filter === 'function') {
      return this.args.filter(searchResults);
    } else {
      return searchResults;
    }
  }
}
