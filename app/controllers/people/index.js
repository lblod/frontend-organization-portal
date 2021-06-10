import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PeopleIndexController extends Controller {
  @service router;
<<<<<<< HEAD
  queryParams = ['page', 'size', 'givenName', 'familyName', 'organization'];

  @tracked page = 0;
  size = 25;
  @tracked sort = 'family-name';
=======
  queryParams = ['givenName', 'familyName', 'organization'];

>>>>>>> Add filters to the people page
  @tracked givenName = '';
  @tracked familyName = '';
  @tracked organization = '';

<<<<<<< HEAD
  get people() {
    return this.model.loadPeopleTaskInstance.isFinished
      ? this.model.loadPeopleTaskInstance.value
      : this.model.loadedPeople;
  }

  get isLoading() {
    return this.model.loadPeopleTaskInstance.isRunning;
  }

  get showTableLoader() {
    return this.isLoading && !this.model.loadedPeople;
  }

  @action
  search(event) {
    event.preventDefault();

    if (this.page > 0) {
      this.resetPagination(); // updating `page` will refresh the model
    } else {
      this.router.refresh();
    }
  }

  resetPagination() {
    this.page = 0;
=======
  @action
  search() {
    this.router.refresh();
>>>>>>> Add filters to the people page
  }
}
