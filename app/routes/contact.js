import Route from '@ember/routing/route';

export default class ContactRoute extends Route {
  resetController(controller) {
    super.resetController(...arguments);

    controller.reset();
  }
}
