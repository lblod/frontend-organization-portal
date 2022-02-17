import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-contact-hub/models/administrative-unit-classification-code';

const MANDATE = 'Mandaat';
const MINISTER = 'Bedienaar';

export default class PeopleNewPositionController extends Controller {
  @service router;
  @service store;

  @tracked selectedOrganization;
  @tracked selectedRole;

  @tracked governingBodyClassifications;
  @tracked governingBodies;
  @tracked selectedGoverningBody;
  @tracked selectedClassification;

  @tracked positionType;

  @tracked positionTypes = [MANDATE, MINISTER];

  @action
  async setOrganization(organization) {
    this.selectedOrganization = null;
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
          const governingBodiesWithOnlyValidPeriod = specializations
            .toArray()
            .filter((s) => s?.period > 1);
          filteredGoverningBodies.push(...governingBodiesWithOnlyValidPeriod);
        }
      }
      return filteredGoverningBodies;
    }
    return null;
  }

  get classificationCodes() {
    return [CLASSIFICATION_CODE.WORSHIP_SERVICE];
  }

  @action
  setGoverningBody(governingBody) {
    this.selectedGoverningBody = governingBody;
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
    this.positionType = positionType;
  }

  @action
  cancel() {
    this.router.transitionTo('people');
  }

  @action
  redirect(event) {
    event.preventDefault();
    if (
      !this.selectedOrganization ||
      !this.positionType ||
      !this.selectedRole
    ) {
      return;
    }
    if (MANDATE === this.positionType) {
      if (!this.selectedGoverningBody) {
        return;
      }
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
  async handleMandateRoleSelect(role) {
    this.selectedRole = role;
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
