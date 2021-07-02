import Route from '@ember/routing/route';

export default class PeoplePersonPositionsPositionIndexRoute extends Route {
  model() {
    return this.modelFor('people.person.positions.position');
  }
}
