import Route from '@ember/routing/route';

export default class PeoplePersonPersonalInformationRequestSensitiveDataRoute extends Route {
  model() {
    return this.modelFor('people.person.personal-information');
  }
}
