import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { action } from '@ember/object';

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

      // TODO: implement pagination once it's possible without 2-way-binding
      // More information: https://github.com/mu-semtech/ember-data-table/issues/27
      // We temporarily increase the number of results to increase the chances that everything fits on one page
      query['page[size]'] = 100;

      let result = yield this.store.query('person', query);
      return this.caseInsensitiveSort(result);
    }
  }

  caseInsensitiveSort(data) {
    const sortedFields = data.slice().sort(
      (a, b) =>
        a.givenName.trim().localeCompare(b.givenName.trim(), undefined, {
          sensitivity: 'base',
        }) ||
        a.familyName.trim().localeCompare(b.familyName.trim(), undefined, {
          sensitivity: 'base',
        })
    );
    return sortedFields;
  }
}

class SeachParams {
  @tracked givenName;
  @tracked familyName;
  @tracked selectedPerson;

  @action
  selectPerson(p, fieldName) {
    if (p?.given_name && p?.family_name) {
      this.givenName = p.given_name;
      this.familyName = p.family_name;
    } else {
      switch (fieldName) {
        case 'family_name':
          this.familyName = p?.family_name || '';
          break;
        case 'given_name':
          this.givenName = p?.given_name || '';
          break;
      }
    }
    this.selectedPerson = {
      given_name: this.givenName,
      family_name: this.familyName,
    };
  }
  constructor() {
    this.reset();
  }

  reset() {
    this.givenName = '';
    this.familyName = '';
  }
}
