import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

const MANDATE = 'Mandaat';
const MINISTER = 'Bedienaar';

export default class PeopleNewPositionController extends Controller {
  @service router;
  @service store;

  @tracked selectedOrganization;
  @tracked selectedRole;
  @tracked valid = false;

  @tracked governingBodyClassifications;
  @tracked governingBodies;
  @tracked selectedGoverningBody;
  @tracked selectedClassification;

  @tracked positionType;

  @tracked positionTypes = [MANDATE, MINISTER];

  @action
  async setOrganization(organization) {
    this.governingBodyClassifications = null;
    this.governingBodies = null;
    this.selectedGoverningBody = null;
    this.selectedRole = null;
    this.selectedClassification = null;
    this.selectedOrganization = organization;
    this.governingBodyClassifications =
      await this.setGoverningBodyClassifications();
  }

  async setGoverningBodyClassifications() {
    const governingBodies = await this.selectedOrganization?.governingBodies;
    if (governingBodies) {
      const classifications = [];
      for (let governingBody of governingBodies.toArray()) {
        const classification = await governingBody.classification;
        if (!classifications.includes(classification)) {
          classifications.push(classification);
        }
      }
      return classifications;
    }
    return null;
  }

  async setGoverningBodies() {
    if (this.selectedClassification) {
      const governingBodies = await this.selectedOrganization?.governingBodies;
      const filteredGoverningBodies = [];
      for (let governingBody of governingBodies.toArray()) {
        const classification = await governingBody.classification;
        if (classification.id === this.selectedClassification.id) {
          const specializations = await governingBody?.hasTimeSpecializations;
          let bodies = specializations.toArray();
          filteredGoverningBodies.push(...bodies);
        }
      }
      return filteredGoverningBodies;
    }
    return null;
  }

  get classificationCodes() {
    if (this.positionType === MINISTER) {
      return [CLASSIFICATION_CODE.WORSHIP_SERVICE];
    }
    return [
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
      CLASSIFICATION_CODE.WORSHIP_SERVICE,
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
      CLASSIFICATION_CODE.DISTRICT,
      CLASSIFICATION_CODE.PROVINCE,
    ];
  }

  @action
  setGoverningBody(governingBody) {
    this.selectedGoverningBody = governingBody;
    this.updateIsValid();
  }

  @action
  async setClassification(classification) {
    this.selectedClassification = classification;
    this.governingBodies = await this.setGoverningBodies();
  }

  @action
  setPositionType(positionType) {
    this.governingBodies = null;
    this.selectedGoverningBody = null;
    this.selectedRole = null;
    this.selectedClassification = null;
    this.selectedOrganization = null;
    this.positionType = positionType;
  }

  @action
  cancel() {
    this.router.transitionTo('people');
  }

  updateIsValid() {
    if (
      !this.selectedOrganization ||
      !this.positionType ||
      !this.selectedRole
    ) {
      this.valid = false;
    } else {
      if (MANDATE === this.positionType) {
        this.valid = !!this.selectedGoverningBody;
      } else {
        this.valid = true;
      }
    }
  }

  @action
  redirect(event) {
    event.preventDefault();

    if (MANDATE === this.positionType) {
      this.router.transitionTo(
        'administrative-units.administrative-unit.governing-bodies.governing-body.mandatory.new',
        this.selectedOrganization.id,
        this.selectedGoverningBody.id,
        { queryParams: { positionId: this.selectedRole.id } }
      );
    } else {
      this.router.transitionTo(
        'administrative-units.administrative-unit.ministers.new',
        this.selectedOrganization.id,
        { queryParams: { positionId: this.selectedRole.id } }
      );
    }
  }

  @action
  async setRole(role) {
    this.selectedRole = role;
    this.updateIsValid();
  }

  reset() {
    this.selectedOrganization = null;
    this.governingBodyClassifications = null;
    this.governingBodies = null;
    this.selectedGoverningBody = null;
    this.selectedRole = null;
    this.selectedClassification = null;
    this.positionType = null;
  }
}
