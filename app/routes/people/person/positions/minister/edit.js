import Route from '@ember/routing/route';

export default class PeoplePersonPositionsMinisterEditRoute extends Route {
  model() {
    return this.modelFor('people.person.positions.minister');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
