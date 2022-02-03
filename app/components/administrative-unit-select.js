import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AdministrativeUnitSelectComponent extends Component {
  @service store;
  @tracked selected;

  constructor() {
    super(...arguments);
    const hack = this.args.loadSelected;
    if (hack) {
      this.loadStartup(hack);
    }
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
  async loadStartup(organizationId) {
    let result = await this.store.findRecord(
      'administrative-unit',
      organizationId
    );
    this.selected = result;
  }

  @action
  onChange(unit) {
    this.selected = unit;
    this.args.onChange(unit);
  }
}
