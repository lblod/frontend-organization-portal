import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsIndexController extends Controller {
  @service router;
  @service currentSession;

  queryParams = [
    'page',
    'size',
    'sort',
    'name',
    'identifier',
    'municipality',
    'province',
    'organizationTypes',
    'classificationIds',
    'recognizedWorshipTypeId',
    'organizationStatus',
  ];

  @tracked page = 0;
  size = 25;
  @tracked sort = 'name';
  @tracked name = '';
  @tracked identifier = '';
  @tracked municipality = '';
  @tracked province = '';
  @tracked organizationTypes = '';
  @tracked classificationIds = '';
  @tracked recognizedWorshipTypeId = '';
  @tracked organizationStatus = '';

  get organizations() {
    return this.model.loadOrganizationsTaskInstance.isFinished
      ? this.model.loadOrganizationsTaskInstance.value
      : this.model.loadedOrganizations;
  }

  get isLoading() {
    return this.model.loadOrganizationsTaskInstance.isRunning;
  }

  get hasPreviousData() {
    return (
      this.model.loadedOrganizations &&
      this.model.loadedOrganizations.length > 0
    );
  }

  get showTableLoader() {
    return this.isLoading && !this.hasPreviousData;
  }

  get hasNoResults() {
    return (
      this.model.loadOrganizationsTaskInstance.isFinished &&
      this.organizations.length === 0
    );
  }

  get hasErrored() {
    return this.model.loadOrganizationsTaskInstance.isError;
  }

  @action
  search(event) {
    event.preventDefault();

    if (this.page > 0) {
      // resetting the pagination will refresh the model
      this.resetPagination();
    } else {
      this.router.refresh();
    }
  }

  @action
  setOrganizationTypes(selection) {
    this.page = null;
    this.organizationTypes = selection.join(',');
  }

  @action
  setClassificationIds(selection) {
    this.page = null;

    this.classificationIds = selection
      .map((classification) => classification.id)
      .join(',');
  }

  @action
  setRecognizedWorshipTypeId(selection) {
    this.page = null;
    this.recognizedWorshipTypeId = selection?.id;
  }

  @action
  setName(selection) {
    this.page = null;
    this.name = selection;
  }

  @action
  setIdentifier(selection) {
    this.page = null;
    this.identifier = selection;
  }

  @action
  setOrganizationStatus(selection) {
    this.page = null;
    if (selection !== null) {
      this.organizationStatus = selection.id;
    } else {
      this.organizationStatus = '';
    }
  }

  @action
  setMunicipality(selection) {
    this.page = null;
    this.municipality = selection;
  }

  @action
  setProvince(selection) {
    // Don't reset pagination if the provincie is set automatically via municipality
    if (!this.municipality) {
      this.page = null;
    }
    if (selection !== null) {
      this.province = selection;
    } else {
      this.province = '';
    }
  }

  resetPagination() {
    this.page = 0;
  }

  @action
  resetFilters() {
    this.name = '';
    this.identifier = '';
    this.municipality = '';
    this.province = '';
    this.organizationTypes = '';
    this.classificationIds = '';
    this.recognizedWorshipTypeId = '';
    this.organizationStatus = '';
    this.page = 0;
    this.sort = 'name';

    // Triggers a refresh of the model
    this.page = null;
  }
}
