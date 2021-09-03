import Route from '@ember/routing/route';

export default class PeoplePersonPositionsMinisterEditRoute extends Route {
  model() {
    return this.modelFor('people.person.positions.minister');
  }
}
