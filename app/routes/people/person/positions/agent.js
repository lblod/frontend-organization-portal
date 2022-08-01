import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsMandatoryRoute extends Route {
  @service store;

  async model({ agentId }) {
    let person = this.modelFor('people.person');

    let agent = await this.store.findRecord('agent', agentId, {
      reload: true,
      include: [
        'board-position.governing-body.is-time-specialization-of.classification',
        'board-position.governing-body.is-time-specialization-of.administrative-unit',
      ].join(),
    });

    return {
      person,
      agent,
    };
  }
}
