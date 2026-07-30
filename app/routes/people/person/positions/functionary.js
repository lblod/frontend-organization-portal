import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';

export default class PeoplePersonPositionsFunctionaryRoute extends Route {
  @service store;

  async model({ functionaryId }) {
    let person = this.modelFor('people.person');

    const { content: functionary } = await this.store.request(
      findRecord('functionary', functionaryId, {
        reload: true,
        include: [
          'board-position.governing-bodies.is-time-specialization-of.classification',
          'board-position.governing-bodies.is-time-specialization-of.administrative-unit',
        ].join(),
      }),
    );

    return {
      person,
      functionary,
    };
  }
}
