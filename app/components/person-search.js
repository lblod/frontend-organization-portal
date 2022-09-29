/* eslint-disable require-yield */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-const-assign */
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
      this.searchParams?.selectedPerson?.given_name?.trim() ||
      this.searchParams?.selectedPerson?.family_name?.trim()
    );
  }

  @restartableTask
  *searchPeopleTask(event) {
    event.preventDefault();
    if (this.searchParams.selectedPerson && this.searchParams.results) {
      const { id } = this.searchParams.selectedPerson;
      if (id) {
        for (const [key, values] of this.searchParams.results) {
          if (id === key.id) {
            const new_map = new Map();
            new_map.set(key, values);
            return {
              first: new_map,
              rest: new Map(),
              hasRest: false,
            };
          }
        }
      }

      return this.sortByOrder(this.searchParams.results);
    }
  }

  sortByOrder(map) {
    const ordered = [...map].sort((a, b) => a[0].order - b[0].order);
    const first = ordered.shift();
    const map_ordered = new Map(ordered);
    return {
      first: new Map([first]),
      rest: map_ordered,
      hasRest: map_ordered.size > 0,
    };
  }
}

class SeachParams {
  @tracked selectedPerson;
  @tracked results;

  @action
  selectPerson(p, results) {
    this.selectedPerson = p;
    this.results = groupBy(results, ({ id, family_name, given_name }) => {
      return { id, family_name, given_name };
    });
  }

  constructor() {
    this.reset();
  }

  reset() {
    this.selectedPerson = null;
    this.results = null;
  }
}
function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item, index) => {
    const key = keyGetter(item);
    let collection = null;
    let max_order = 0;
    for (const [k, values] of map) {
      if (key.id === k.id) {
        collection = values;
      }
      if (k.order > max_order) {
        max_order = k.order;
      }
    }
    if (!collection) {
      key.order = max_order + 1;
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}
