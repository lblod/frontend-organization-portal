import Controller from '@ember/controller';

export default class OrganizationsOrganizationController extends Controller {
  // TODO: arguably this kind of logic belongs in the model
  get requiresGoverningBodies() {
    return !(
      this.model.isAgb ||
      this.model.isApb ||
      this.model.isIgs ||
      this.model.isPoliceZone ||
      this.model.isAssistanceZone ||
      this.model.isOcmwAssociation ||
      this.model.isPevaMunicipality ||
      this.model.isPevaProvince ||
      this.model.isRepresentativeBody
    );
  }

  get requiresFunctionaries() {
    return !(
      this.model.isDistrict ||
      this.model.isWorshipAdministrativeUnit ||
      this.model.isPoliceZone ||
      this.model.isAssistanceZone ||
      this.model.isPevaMunicipality ||
      this.model.isPevaProvince ||
      this.model.isRepresentativeBody
    );
  }
}
