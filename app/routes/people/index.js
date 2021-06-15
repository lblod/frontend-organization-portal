import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class PeopleIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true }
  }

  model(params) {
    return {
      loadPeopleTaskInstance: this.loadPeopleTask.perform(params),
      loadedPeople: this.loadPeopleTask.lastSuccessful?.value
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadPeopleTask(params) {
    let query = {
      // Includes slow down the API response so we disable them for now.
      // include: [
      //   'mandatories.status',
      //   'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit',
      //   'mandatories.mandate.role-board',
      // ].join(),
      page: {
        number: params.page,
        size: params.size
      },
      sort: params.sort,
    };

    if (params.givenName) {
      query['filter[given-name]'] = params.givenName;
    }

    if (params.familyName) {
      query['filter[family-name]'] = params.familyName;
    }

    if (params.organization) {
      query['filter[mandatories][mandate][governing-body][is-time-specialization-of][administrative-unit][name]'] = params.organization;
    }

    return yield this.store.query('person', query);
  }
}
