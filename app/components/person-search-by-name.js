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
  @tracked results;

  @restartableTask
  *loadPersonTask(searchParams = '') {
    const filter = {};
    this.searching = true;
    const params = searchParams
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter((p) => p.trim().length);
    let param_object = { family_name: params[0], given_name: params[1] || '' };

    const q_params = params.join(' OR ');
    if (q_params.length) {
      filter[
        `:query:given_name`
      ] = `(family_name: (${q_params}*)) OR (given_name: (${q_params}*))`;
    }

    let result = yield this.muSearch.search({
      index: 'people',
      page: '0',
      size: '100',
      filters: filter,
      dataMapping: (data) => {
        const entry = data.attributes;
        return {
          id: entry.id,
          family_name: entry.family_name.trim().toLowerCase(),
          given_name: entry.given_name.trim().toLowerCase(),
          data: entry,
        };
      },
    });
    result = removeDuplicates(result.toArray(), ['family_name', 'given_name']);

    this.results = [];

    for (const person of result.map((r) => r.data)) {
      if (person.uri.includes('/rollenBedienaar/')) {
        person.positionRoute = 'people.person.positions.minister';
      } else if (person.uri.includes('/mandatarissen/')) {
        person.positionRoute = 'people.person.positions.mandatory';
      } else if (person.uri.includes('/functionarissen/')) {
        person.positionRoute = 'people.person.positions.agent';
      }

      // In the case of functionarissen, a bestuursfunctie is linked to multiple units (OCMW and Gemeente)
      person.organizations = [];
      if (Array.isArray(person.organization_id)) {
        for (let [index, id] of person.organization_id.entries()) {
          person.organizations.push({
            id,
            classification: person.organization_classification[index],
          });
        }
      } else {
        person.organizations = [
          {
            id: person.organization_id,
            classification: person.organization_classification,
          },
        ];
      }
      this.results.push(person);
    }

    if (params.length && result) {
      const arr = [...[param_object], ...result];
      return arr;
    }
    return result;
  }
  @action
  changed(p) {
    this.searching = false;
    this.args.onChange(p, this.results);
  }
}
