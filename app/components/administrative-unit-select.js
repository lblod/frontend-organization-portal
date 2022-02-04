import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout, task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitSelectComponent extends Component {
  @service store;
  @tracked loadedRecord;
  constructor() {
    super(...arguments);
    this.loadRecord.perform();
  }
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

  get selectedAdministrativeUnit() {
    if (typeof this.args.selected === 'string') {
      return this.loadedRecord;
    }

    return this.args.selected;
  }

  @task
  *loadRecord() {
    let selectedOrganization = this.args.selected;
    if (typeof selectedOrganization === 'string') {
      this.loadedRecord = yield this.store.findRecord(
        'administrative-unit',
        selectedOrganization
      );
    }
  }
}
