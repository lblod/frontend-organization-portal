import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';

export default class PeopleIndexRoute extends Route {
  @service store;
  @service muSearch;
  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
    status: { refreshModel: true, replace: true },
    position: { refreshModel: true, replace: true },
    organization: { refreshModel: true, replace: true },
    given_name: { refreshModel: true, replace: true },
    family_name: { refreshModel: true, replace: true },
  };

  model(params) {
    return {
      loadPeopleTaskInstance: this.loadPeopleTask.perform(params),
      loadedPeople: this.loadPeopleTask.lastSuccessful?.value,
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadPeopleTask(params) {
    const filter = {};
    if (params.given_name) {
      filter[':phrase_prefix:given_name'] = `${params.given_name.trim()}`;
    }
    if (params.family_name) {
      filter[':phrase_prefix:family_name'] = `${params.family_name.trim()}`;
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

    const page = yield this.muSearch.search({
      index: 'people',
      page: params.page,
      size: params.size,
      sort: params.sort,
      filters: filter,
      dataMapping: (data) => {
        const entry = data.attributes;
        entry.end_date = entry.end_date ? new Date(entry.end_date) : null;
        return entry;
      },
    });

    for (const person of page.toArray()) {
      // TODO
      // another option would be to reindex everything & keeping the type instead
      // but this seems too much just to allow opening the link in a new tab...
      // if it is a better option (reindex), we can do it as well

      if (person.uri.includes('/rollenBedienaar/')) {
        person.positionRoute = 'people.person.positions.minister';
      } else if (person.uri.includes('/mandatarissen/')) {
        person.positionRoute = 'people.person.positions.mandatory';
      }
    }
    return page;
  }
}
