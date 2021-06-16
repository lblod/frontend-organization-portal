import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class AdministrativeUnitsIndexRoute extends Route {
  @service store;

  model(params) {
    let query = {};

    if (params.name) {
      query['filter[name]'] = params.name;
    }

    if (params.classification) {
      query['filter[classification][:id:]'] = params.classification;
    }

    if (params.municipality) {
      query['filter[primary-site][address][municipality]'] =
        params.municipality;
    }

    if (params.organizationStatus) {
      query['filter[organization-status][:id:]'] = params.organizationStatus;
    }

    return hash({
      classifications: this.store.findAll(
        'administrative-unit-classification-code'
      ),
      statuses: this.store.findAll('organization-status-code'),
      administrativeUnit: this.store.query('administrative-unit', query),
    });
  }
}
