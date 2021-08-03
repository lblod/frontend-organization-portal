import Route from '@ember/routing/route';

export default class PeoplePersonPositionsMandatoryIndexRoute extends Route {
  model() {
    return this.modelFor('people.person.positions.mandatory');
  }
}
