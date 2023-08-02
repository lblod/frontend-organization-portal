import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * Remove duplicates from an array
 * @param {the array} arr
 * @param {the fields that will be used to find duplicates} fields
 * @returns
 */
function removeDuplicates(arr, fields) {
  return arr.filter(
    (v, i, a) => a.findIndex((v2) => fields.every((k) => v2[k] === v[k])) === i
  );
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
        const entry = data.attributes;
        return {
          given_name: entry.given_name.trim().toLowerCase(),
          family_name: entry.family_name.trim().toLowerCase(),
        };
      },
    });
    result = removeDuplicates(result.slice(), ['family_name', 'given_name']);
    if (searchParams.trim() !== '' && result) {
      let param_object = {
        family_name: '',
        given_name: '',
      };
      param_object[fieldName] = searchParams.trim();
      const arr = [...[param_object], ...result];
      return arr;
    }
    return result;
  }
  @action
  changed(p) {
    this.searching = false;
    this.args.onChange(p, this.args.fieldName);
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
