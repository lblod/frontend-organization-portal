import Route from '@ember/routing/route';

export default class PeoplePersonPositionsMinisterIndexRoute extends Route {
  model() {
    return this.modelFor('people.person.positions.minister');
  }
}
