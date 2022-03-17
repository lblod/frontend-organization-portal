import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
export default class PeoplePersonPersonalInformationController extends Controller {
  queryParams = ['reasonCode'];

  @tracked reasonCode;

  reset() {
    this.reasonCode = null;
  }
}
