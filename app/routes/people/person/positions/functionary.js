import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsFunctionaryRoute extends Route {
  @service store;

  async model({ functionaryId }) {
    let person = this.modelFor('people.person');

    let functionary = await this.store.findRecord(
      'functionary',
      functionaryId,
      {
        reload: true,
        include: [
          'board-position.governing-bodies.is-time-specialization-of.classification',
          'board-position.governing-bodies.is-time-specialization-of.administrative-unit',
        ].join(),
      },
    );

    return {
      person,
      functionary,
    };
  }
}
