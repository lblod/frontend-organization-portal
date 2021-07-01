import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.core-data'
    );

    let contacts = await administrativeUnit.get('primarySite.contacts');
    if (contacts.length === 0) {
      contacts.pushObject(this.store.createRecord('contact-point'));
    }

    return hash({
      administrativeUnit,
      honoraryServiceTypes: this.store.findAll('honorary-service-type'),

      // TODO: These are slow requests. We should do the data fetching only once per app boot.
      // store.query always does an API call so it probably requires a custom service which does
      // the request if needed and directly returns the data otherwise.
      provinces: this.store
        .query('location', {
          filter: {
            level: 'Provincie',
          },
        })
        .then(function (provinces) {
          return provinces.mapBy('label');
        }),
      municipalities: this.store
        .query('location', {
          filter: {
            level: 'Gemeente',
          },
          page: {
            size: 400,
          },
        })
        .then(function (municipalities) {
          return municipalities.mapBy('label');
        }),
    });
  }
}
