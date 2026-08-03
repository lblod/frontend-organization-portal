import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';

export default class PeoplePersonPositionsMandatoryRoute extends Route {
  @service store;

  async model({ mandatoryId }) {
    const person = this.modelFor('people.person');

    const { content: mandatory } = await this.store.request(
      findRecord('mandatory', mandatoryId, {
        reload: true,
        include: [
          'contacts.contact-address',
          'mandate.role-board',
          'mandate.governing-body.is-time-specialization-of.classification',
          'mandate.governing-body.is-time-specialization-of.administrative-unit',
        ].join(),
      }),
    );

    return {
      person,
      mandatory,
    };
  }
}
