import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class PeoplePersonPersonalInformationEditController extends Controller {
  @service router;

  @dropTask
  *save(event) {
    event.preventDefault();

    yield this.model.person.save();

    this.router.transitionTo(
      'people.person.personal-information',
      this.model.person.id
    );
  }
}
