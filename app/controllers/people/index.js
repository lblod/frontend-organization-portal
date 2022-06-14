import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class PeopleIndexController extends Controller {
  @service router;
  @service store;
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
  @tracked sort = 'given_name,family_name';
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

  @action
  async navigateToPosition(person) {
    const ministerPosition = await this.store.query(
      'minister-position-function',
      {
        'filter[:id:]': person.position_id,
      }
    );
    if (ministerPosition.toArray().length) {
      this.router.transitionTo(
        'people.person.positions.minister',
        person.id,
        person.uuid
      );
    } else {
      this.router.transitionTo(
        'people.person.positions.mandatory',
        person.id,
        person.uuid
      );
    }
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

  @action
  resetFilters() {
    this.given_name = '';
    this.family_name = '';
    this.organization = null;
    this.selectedOrganization = null;
    this.status = true;
    this.position = null;
    this.page = 0;
    this.sort = 'given_name,family_name';

    // Triggers a refresh of the model
    this.page = null;
  }

  get classificationCodes() {
    return [
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
      CLASSIFICATION_CODE.WORSHIP_SERVICE,
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
      CLASSIFICATION_CODE.DISTRICT,
      CLASSIFICATION_CODE.PROVINCE,
    ];
  }
}
