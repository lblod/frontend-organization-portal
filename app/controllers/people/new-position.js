import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PeopleNewPositionController extends Controller {
  valid = false;

  @action
  cancel() {
    this.router.transitionTo('people');
  }
}
