import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsIndexRoute extends Route {
  @service store;

  async model() {
    let { id: personId } = this.paramsFor('people.person');

    let person = await this.store.findRecord('person', personId, {
      reload: true,
      include: [
        'mandatories.mandate.role-board',
        'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit',
        'agents-in-position',
      ].join(),
    });

    return {
      person,
      positions: await person.mandatories,
      ministerPositions: await person.agentsInPosition,
    };
  }
}
