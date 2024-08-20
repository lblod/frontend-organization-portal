import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PeoplePersonPersonalInformationRequestSensitiveDataController extends Controller {
  @service router;
  @service store;
  @service sensitivePersonalInformation;
  @tracked reasonCode;

  queryParams = ['redirectUrl'];
  @tracked redirectUrl;

  constructor() {
    super(...arguments);
    this.loadReasonCodes.perform();
  }

  @action
  async submit(event) {
    event.preventDefault();

    let { person, organizationPersonType } = this.model;

    await this.sensitivePersonalInformation.getInformation(
      person,
      this.reasonCode,
      organizationPersonType,
    );
    this.router.refresh();
    this.router.transitionTo(`${this.redirectUrl}`);
  }

  @task *loadReasonCodes() {
    return yield this.store.findAll('request-reason');
  }

  reset() {
    this.reasonCode = null;
    this.redirectUrl = null;
  }

  @action
  cancel() {
    this.router.transitionTo('people.person.personal-information');
  }
}
