import {attr, belongsTo } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';

export default class WorshipServiceModel extends AdministrativeUnitModel {
    @attr denomination;
    @attr('boolean') crossBorder;
    @belongsTo('honorary-service-type') honoraryServiceType;
    @belongsTo('central-worship-service') centralService;
    @belongsTo('representative-body') representiveBody;
  
  get crossBorderNominal() {
    if (this.crossBorder != '') {
      return ''
    } else if (this.crossBorder) {
      return 'Ja'
    } else {
      return `Nee`;
    }
  }
}
