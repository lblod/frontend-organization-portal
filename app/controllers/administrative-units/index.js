import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsIndexController extends Controller {
  @service router;
  queryParams = [
    'page',
    'size',
    'sort',
    'name',
    'identifier',
    'municipality',
    'province',
    'classificationId',
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

  get administrativeUnits() {
    return this.model.loadAdministrativeUnitsTaskInstance.isFinished
      ? this.model.loadAdministrativeUnitsTaskInstance.value
      : this.model.loadedAdministrativeUnits;
  }

  get isLoading() {
    return this.model.loadAdministrativeUnitsTaskInstance.isRunning;
  }

  get hasPreviousData() {
    return (
      this.model.loadedAdministrativeUnits &&
      this.model.loadedAdministrativeUnits.length > 0
    );
  }

  get showTableLoader() {
    return this.isLoading && !this.hasPreviousData;
  }

  get hasNoResults() {
    return (
      this.model.loadAdministrativeUnitsTaskInstance.isFinished &&
      this.administrativeUnits.length === 0
    );
  }

  get hasErrored() {
    return this.model.loadAdministrativeUnitsTaskInstance.isError;
  }

  get modelHasOnlyWorshipAdministrativeUnits() {
    if (this.administrativeUnits && this.administrativeUnits.length) {
      return !this.administrativeUnits.toArray().some((adminUnit) => {
        return (
          adminUnit.classification_id !== CLASSIFICATION_CODE.WORSHIP_SERVICE &&
          adminUnit.classification_id !==
            CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
        );
      });
    }
    return false;
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isAgbOrApb() {
    return this.isAgb || this.isApb;
  }
  get isAgb() {
    return this.classificationId === CLASSIFICATION_CODE.AGB;
  }

  get isApb() {
    return this.classificationId === CLASSIFICATION_CODE.APB;
  }
  get isWorshipService() {
    return this.classificationId === CLASSIFICATION_CODE.WORSHIP_SERVICE;
  }

  get isCentralWorshipService() {
    return (
      this.classificationId === CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
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
  setClassificationId(selection) {
    this.page = null;
    this.classificationIds = selection;
    if (!this.isWorshipAdministrativeUnit) {
      this.recognizedWorshipTypeId = '';
    }
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
    this.classificationId = '';
    this.recognizedWorshipTypeId = '';
    this.organizationStatus = '';
    this.page = 0;
    this.sort = 'name';

    // Triggers a refresh of the model
    this.page = null;
  }
}
