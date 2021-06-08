import Route from '@ember/routing/route';

// eslint-disable-next-line ember/no-mixins
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class PeopleIndexRoute extends Route.extend(DataTableRouteMixin){
  modelName = 'person';

  mergeQueryOptions() {
    return {
      include: [
        'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit',
        'mandatories.mandate.role-board',
      ].join()
    }
  }
}
