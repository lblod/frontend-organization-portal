import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const MANDATORY = 'Mandataris';
const MINISTER = 'Bedienaar';

export default class PeopleNewPositionController extends Controller {
  @service router;
  @service store;

  @tracked selectedOrganization;

  @tracked governingBodies;
  @tracked selectedGoverningBody;

  @tracked positionType;

  @tracked positionTypes = [MANDATORY, MINISTER];

  @action
  async setOrganization(organization) {
    this.selectedOrganization = organization;
    this.governingBodies = await this.selectedOrganization?.governingBodies;
    this.selectedGoverningBody = null;
  }

  @action
  setGoverningBody(governingBody) {
    this.selectedGoverningBody = governingBody;
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

  reset() {}
}
