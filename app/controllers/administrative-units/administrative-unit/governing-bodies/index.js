import Controller from '@ember/controller';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesIndexController extends Controller {
  get governingBodies() {
    if (
      this.model.governingBodies.firstObject.hasTimeSpecializations.length > 0
    ) {
      return [this.model.governingBodies.firstObject.hasTimeSpecializations];
    }

    // use a fallback
    if (this.model.governingBodies) {
      return [this.model.governingBodies];
    }

    return [];
  }
}
