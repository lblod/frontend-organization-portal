import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeopleIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true }
  }

  model(params) {
    let query = {
      include: [
        'mandatories.status',
        'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit',
        'mandatories.mandate.role-board',
      ].join(),
      page: {
        number: params.page,
        size: params.size
      }
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

    return this.store.query('person', query);
  }
}
