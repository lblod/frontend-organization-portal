import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PeoplePersonPersonalInformationRequestSensitiveDataController extends Controller {
  @service router;
  @service store;
  @tracked reasonCode;

  constructor() {
    super(...arguments);
    this.loadReasonCodes.perform();
  }
  @action
  async submit(event) {
    event.preventDefault();
    this.router.transitionTo('people.person.personal-information', {
      queryParams: { reasonCode: this.reasonCode.id },
    });
  }

  @task *loadReasonCodes() {
    return yield this.store.findAll('request-reason');
  }

  @action
  cancel() {
    this.router.transitionTo('people.person.personal-information');
  }
}
