import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

export default class PeoplePersonIndexController extends Controller {
  @tracked isEditingPersonalInformation = false;

  @action
  toggleEditPersonalInformation() {
    this.isEditingPersonalInformation = !this.isEditingPersonalInformation;
  }

  @dropTask
  *savePersonalInformation(event) {
    event.preventDefault();

    yield this.model.save();

    this.toggleEditPersonalInformation();
  }
}
