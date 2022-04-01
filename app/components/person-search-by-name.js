import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

function getUniqueListBy(arr, key1, key2) {
  return [
    ...new Map(arr.map((item) => [item[key1] + item[key2], item])).values(),
  ];
}

export default class PersonSearchByNameComponent extends Component {
  @service muSearch;
  @tracked searching;

  @restartableTask
  *loadPersonTask(searchParams = '') {
    const filter = {};
    this.searching = true;
    const fieldName = this.args.fieldName; // either given_name or family_name
    if (searchParams.trim() !== '') {
      filter[`:phrase_prefix:${fieldName}`] = searchParams;
    }

    let result = yield this.muSearch.search({
      index: 'people',
      sort: fieldName,
      page: '0',
      size: '100',
      filters: filter,
      dataMapping: (data) => {
        let entry = data.attributes;
        entry.id = data.id;
        return entry;
      },
    });

    result = getUniqueListBy(result.toArray(), 'given_name', 'family_name');
    if (searchParams.trim() !== '' && result) {
      let param_object = {
        family_name: '',
        given_name: '',
      };
      param_object[fieldName] = searchParams.trim();
      return [...[param_object], ...result];
    }
    return result;
  }
  @action
  changed(p) {
    this.searching = false;
    this.args.onChange(p);
  }
  @action
  getLabel(person) {
    if (!this.searching) {
      return person[this.args.fieldName];
    } else {
      return `${person.given_name} ${person.family_name}`;
    }
  }
}
