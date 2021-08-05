import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class PersonSearchComponent extends Component {
  @service store;

  searchParams = new SeachParams();

  get canSearch() {
    return (
      this.searchParams.givenName.trim() || this.searchParams.familyName.trim()
    );
  }

  @restartableTask
  *searchPeopleTask(event) {
    event.preventDefault();

    if (this.canSearch) {
      let query = {};

      if (this.searchParams.givenName) {
        query['filter[given-name]'] = this.searchParams.givenName;
      }

      if (this.searchParams.familyName) {
        query['filter[family-name]'] = this.searchParams.familyName;
      }

      return yield this.store.query('person', query);
    }
  }
}

class SeachParams {
  @tracked givenName;
  @tracked familyName;

  constructor() {
    this.reset();
  }

  reset() {
    this.givenName = '';
    this.familyName = '';
  }
}
