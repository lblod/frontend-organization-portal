import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsIndexController extends Controller {
  @service store;

  @tracked typeEredienst = null;
  @tracked typesEredienstOptions;

  @tracked stausOrg = null;
  
  constructor() {
    super(...arguments);
    this.getTypesEredienst()
  }

  async getTypesEredienst() {
    const typesEredienstOptions = await this.store.findAll('honorary-service-type');

    this.typesEredienstOptions = typesEredienstOptions;
    
  }
  
  @action
  async handleTypeEredienstSelection(typeEredienst) {
    if (typeEredienst) {
      this.typeEredienst = typeEredienst;
      
      this.model.filter((adminUnit) => {
        return (
          adminUnit.honoraryServiceType.label == typeEredienst
        )
      });
    } else {
      this.typeEredienst = null;
    }
  }
}
