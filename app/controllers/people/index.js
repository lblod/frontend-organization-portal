import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PeopleIndexController extends Controller {
  @service router;

  queryParams = ['page', 'size', 'name', 'organization', 'status', 'positie'];
  @tracked status = true;
  @tracked positie;

  @tracked page = 0;
  size = 25;
  @tracked sort = 'family-name';
  @tracked name = '';
  @tracked organization = '';

  get people() {
    return this.model.loadPeopleTaskInstance.isFinished
      ? this.model.loadPeopleTaskInstance.value
      : this.model.loadedPeople;
  }

  get isLoading() {
    return this.model.loadPeopleTaskInstance.isRunning;
  }

  get hasPreviousData() {
    return this.model.loadedPeople && this.model.loadedPeople.length > 0;
  }

  get showTableLoader() {
    return this.isLoading && !this.hasPreviousData;
  }

  get hasNoResults() {
    return (
      this.model?.loadPeopleTaskInstance?.isFinished &&
      this?.people?.length === 0
    );
  }

  get hasErrored() {
    return this.model.loadPeopleTaskInstance.isError;
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
  @action
  setPosition(event) {
    this.positie = event.id;
  }

  resetPagination() {
    this.page = 0;
  }
}
