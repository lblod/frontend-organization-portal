import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class PeopleIndexRoute extends Route {
  @service store;
  @service muSearch;
  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
    organization: { replace: true },
    status: { refreshModel: true },
    position: { refreshModel: true },
    name: { replace: true },
  };

  model(params) {
    return {
      loadPeopleTaskInstance: this.loadPeopleTask.perform(params),
      loadedPeople: this.loadPeopleTask.lastSuccessful?.value,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadPeopleTask(params) {
    const filter = {};
    if (params.name) {
      filter['given_name,family_name'] = params.name;
    }
    if (params.status) {
      let date = new Date().toISOString().slice(0, -5);
      filter[
        ':query:end_date'
      ] = `(NOT (_exists_:end_date))  OR (end_date:[${date} TO *] ) `;
    }
    if (params.position) {
      filter['position_id'] = params.position;
    }
    if (params.organization) {
      filter['organization_id'] = params.organization;
    }

    return yield this.muSearch.search(
      'people',
      params.page,
      params.size,
      params.sort,
      filter,
      (data) => {
        const entry = data.attributes;
        entry.end_date = entry.end_date ? new Date(entry.end_date) : null;
        return entry;
      }
    );
  }
}
