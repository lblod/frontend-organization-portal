import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class PeopleIndexController extends Controller {
  @service router;
  @service store;
  @service currentSession;
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
  setGivenName(given_name) {
    this.page = null;
    this.given_name = given_name;
  }

  @action
  setFamilyName(family_name) {
    this.page = null;
    this.family_name = family_name;
  }

  @action
  setPosition(position) {
    this.page = null;
    this.position = position?.id;
  }

  @action
  setOrganization(organization) {
    this.page = null;
    this.organization = organization?.id;
    this.selectedOrganization = organization;
  }

  @action
  search(event) {
    event.preventDefault();

    if (this.page > 0) {
      this.resetPagination();
    } else {
      this.router.refresh();
    }
  }

  resetPagination = () => (this.page = null);

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
    let allowedIds = [
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
      CLASSIFICATION_CODE.WORSHIP_SERVICE,
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
      CLASSIFICATION_CODE.DISTRICT,
      CLASSIFICATION_CODE.PROVINCE,
      CLASSIFICATION_CODE.AGB,
      CLASSIFICATION_CODE.APB,
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION_CODE.WELZIJNSVERENIGING,
      CLASSIFICATION_CODE.AUTONOME_VERZORGINGSINSTELLING,
      // TODO: uncomment when onboarding OCMW associations
      // CLASSIFICATION_CODE.ZIEKENHUISVERENIGING,
      // CLASSIFICATION_CODE.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      // CLASSIFICATION_CODE.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ];

    if (this.currentSession.hasUnitRole) {
      allowedIds = allowedIds.filter(
        (id) =>
          ![
            CLASSIFICATION_CODE.WORSHIP_SERVICE,
            CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
          ].includes(id)
      );
    } else {
      allowedIds = [
        CLASSIFICATION_CODE.WORSHIP_SERVICE,
        CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
      ];
    }
    return allowedIds;
  }
}
