import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsPositionIndexRoute extends Route {
  @service store;

  async model() {
    let person = this.modelFor('people.person');

    let { positionId: mandatoryId } = this.paramsFor(
      'people.person.positions.position'
    );

    let mandatory = this.store.findRecord('mandatory', mandatoryId, {
      reload: true,
      include: [
        'mandate.role-board',
        'mandate.governing-body.is-time-specialization-of.administrative-unit',
      ].join(),
    });

    return {
      person,
      mandatory,
    };
  }
}
