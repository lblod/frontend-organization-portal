import Route from '@ember/routing/route';

export default class PeoplePersonIndexRoute extends Route {
  model() {
    return this.modelFor('people.person');
  }
}
