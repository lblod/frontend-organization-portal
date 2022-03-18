import Route from '@ember/routing/route';

export default class PeoplePersonPersonalInformationRequestSensitiveDataRoute extends Route {
  queryParams = {
    redirectUrl: { replace: true },
  };
  model() {
    return this.modelFor('people.person.personal-information');
  }

  resetController(controller) {
    super.resetController(...arguments);

    controller.reset();
  }
}
