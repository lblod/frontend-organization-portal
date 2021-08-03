import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsMandatoryRoute extends Route {
  @service store;

  async model() {
    let person = this.modelFor('people.person');

    let { positionId: mandatoryId } = this.paramsFor(
      'people.person.positions.mandatory'
    );

    let mandatory = this.store.findRecord('mandatory', mandatoryId, {
      reload: true,
      include: [
        'contacts',
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
