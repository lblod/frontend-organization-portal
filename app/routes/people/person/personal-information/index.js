import Route from '@ember/routing/route';

export default class PeoplePersonPersonalInformationIndexRoute extends Route {
  model() {
    return this.modelFor('people.person.personal-information');
  }
}
