import WorshipAdministrativeUnitModel from './worship-administrative-unit';
import { CentralWorshipServiceCodeList } from '../constants/classification';

export default class CentralWorshipServiceModel extends WorshipAdministrativeUnitModel {
  get isCentralWorshipService() {
    return this._hasClassificationId(CentralWorshipServiceCodeList);
  }
}
