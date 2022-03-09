import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PeopleIndexController extends Controller {
  @service router;
  queryParams = [
    'page',
    'size',
    'given_name',
    'family_name',
    'organization',
    'status',
    'position',
  ];
  @tracked status = true;
  @tracked position;

  @tracked page = 0;
  size = 25;
  @tracked sort = 'family_name';
  @tracked given_name = '';
  @tracked family_name = '';
  @tracked organization;
  @tracked selectedOrganization;

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
      this.model.loadPeopleTaskInstance.isFinished && this.people.length === 0
    );
  }

  get hasErrored() {
    return this.model.loadPeopleTaskInstance.isError;
  }

  @action
  setPosition(position) {
    this.position = position?.id;
  }

  @action
  setOrganization(organization) {
    this.organization = organization?.id;
    this.selectedOrganization = organization;
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
