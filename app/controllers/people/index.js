import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class PeopleIndexController extends Controller {
  @tracked shortedModel;

  constructor() {
    super(...arguments);
    this.getAdminUnitInfo()
  }

  async getAdminUnitInfo() {
    //let shortedModel = [];

    const mandatories = await this.model.mandatories;
    const mandate = await mandatories[0].mandate;
    const tempGoverningBody = await mandate.governingBody;
    const governingBody = await tempGoverningBody.isTimeSpecializationOf;
    const adminUnit = await governingBody.administrativeUnit;
    const role = await mandate.roleBoard;

    // TODO: Array to fill the table. Include only:  this.model.givenName, this.model.familyName, adminUnit.name and role.label
        
    //this.shortedModel = shortedModel
    
  }

}