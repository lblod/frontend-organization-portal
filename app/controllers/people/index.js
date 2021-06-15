import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PeopleIndexController extends Controller {
  @service router;
  queryParams = ['page', 'size', 'givenName', 'familyName', 'organization'];

  @tracked page = 0;
  size = 25;
  @tracked sort = 'family-name';
  @tracked givenName = '';
  @tracked familyName = '';
  @tracked organization = '';

  get people() {
    return this.model.loadPeopleTaskInstance.isFinished ?
      this.model.loadPeopleTaskInstance.value :
      this.model.loadedPeople;
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
  }
}
