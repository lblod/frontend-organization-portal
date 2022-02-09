import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const MANDATORY = 'Mandataris';
const MINISTER = 'Bedienaar';

export default class PeopleNewPositionController extends Controller {
  @service router;
  @service store;

  queryParams = ['redirectUrl'];

  @tracked redirectUrl;

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
    this.governingBody = governingBody;
  }

  @action
  setPositionType(positionType) {
    this.positionType = positionType;
  }

  @action
  cancel() {
    if (this.redirectUrl) {
      this.router.transitionTo(this.redirectUrl);
    } else {
      this.router.transitionTo('people');
    }
  }

  @action
  redirect() {
    if (!this.selectedOrganization || !this.positionType) {
      return;
    }
    if (MANDATORY === this.positionType) {
      console.log('smth00');
    } else {
      console.log('smth00 lese');
    }
  }

  reset() {
    this.redirectUrl = null;
    //this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    //this.model.person.rollbackAttributes();
  }
}
