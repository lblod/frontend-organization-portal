import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsMandatoryRoute extends Route {
  @service store;

  async model({ mandatoryId }) {
    let person = this.modelFor('people.person');

    let mandatory = await this.store.findRecord('mandatory', mandatoryId, {
      reload: true,
      include: [
        'contacts.contact-address',
        'type-half',
        'mandate.role-board',
        'mandate.governing-body.is-time-specialization-of.classification',
        'mandate.governing-body.is-time-specialization-of.administrative-unit',
      ].join(),
    });

    return {
      person,
      mandatory,
    };
  }
}
