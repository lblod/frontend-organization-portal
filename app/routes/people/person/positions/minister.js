import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsMinisterRoute extends Route {
  @service store;

  async model() {
    let person = this.modelFor('people.person');

    let { positionId: ministerId } = this.paramsFor(
      'people.person.positions.minister'
    );

    let minister = this.store.findRecord('minister', ministerId, {
      reload: true,
      include: ['contacts', 'minister-position'].join(),
    });

    return {
      person,
      minister,
    };
  }
}
