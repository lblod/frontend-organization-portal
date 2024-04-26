import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class OrganizationsIndexController extends Controller {
  @service router;
  queryParams = [
    'page',
    'size',
    'sort',
    'name',
    'identifier',
    'municipality',
    'province',
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

  get modelHasOnlyWorshipOrganizations() {
    if (this.organizations && this.organizations.length) {
      return !this.organizations.slice().some((org) => {
        return (
          org.classification_id !== CLASSIFICATION.WORSHIP_SERVICE.id &&
          org.classification_id !== CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id &&
          org.classification_id !== CLASSIFICATION.REPRESENTATIVE_BODY.id
        );
      });
    }
    return false;
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
    this.classificationIds = '';
    this.recognizedWorshipTypeId = '';
    this.organizationStatus = '';
    this.page = 0;
    this.sort = 'name';

    // Triggers a refresh of the model
    this.page = null;
  }
}
