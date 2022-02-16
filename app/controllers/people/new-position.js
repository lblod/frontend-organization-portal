import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const MANDATORY = 'Mandaat';
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

  @tracked positionTypes = [MANDATORY, MINISTER];

  @action
  async setOrganization(organization) {
    this.selectedOrganization = organization;
    this.governingBodyClassifications =
      await this.setGoverningBodyClassifications();
    this.selectedGoverningBody = null;
    this.positionType = null;
    this.selectedRole = null;
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
          console.log(specializations);
          filteredGoverningBodies.push(...specializations.toArray());
        }
      }
      return filteredGoverningBodies;
    }
    return null;
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
    this.positionType = positionType;
  }

  @action
  cancel() {
    this.router.transitionTo('people');
  }

  @action
  redirect(event) {
    event.preventDefault();
    if (!this.selectedOrganization || !this.positionType) {
      return;
    }
    if (MANDATORY === this.positionType) {
      if (!this.selectedGoverningBody) {
        return;
      }
      this.router.transitionTo(
        'administrative-units.administrative-unit.governing-bodies.governing-body.mandatory.new',
        this.selectedOrganization.id,
        this.selectedGoverningBody.id
      );
    } else {
      this.router.transitionTo(
        'administrative-units.administrative-unit.ministers.new',
        this.selectedOrganization.id
      );
    }
  }

  @action
  async handleMandateRoleSelect(role) {
    this.selectedRole = role;
  }

  reset() {
    this.selectedRole = null;
    this.selectedOrganization = null;
    this.governingBodyClassifications = null;
    this.selectedGoverningBody = null;
    this.selectedClassification = null;
    this.positionType = null;
    this.governingBodies = null;
  }
}
