import Route from '@ember/routing/route';

export default class PeoplePersonPersonalInformationRoute extends Route {
  model() {
    return this.modelFor('people.person');
  }
}
