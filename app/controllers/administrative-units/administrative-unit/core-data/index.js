import { helper } from '@ember/component/helper';
import Controller from '@ember/controller';
import { ID_NAME } from 'frontend-contact-hub/models/identifier';
import WorshipServiceModel from 'frontend-contact-hub/models/worship-service';

const SHAREPOINT_LINK_BASE = {
  WORSHIP_SERVICE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-Erediensten/Lists/Lijst%20Eredienstbesturen/AllItems.aspx?view=7&q=',
  CENTRAL_WORSHIP_SERVICE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-Erediensten/Lists/Lijst%20CKB1/AllItems.aspx?view=7&q=',
};

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexController extends Controller {
  isSharePointIdentifier = helper(function isSharePointIdentifier([
    identifier,
  ]) {
    return identifier?.idName === ID_NAME.SHAREPOINT;
  });

  get isWorshipService() {
    return this.model.administrativeUnit instanceof WorshipServiceModel;
  }

  get sharePointLinkBase() {
    return this.isWorshipService
      ? SHAREPOINT_LINK_BASE.WORSHIP_SERVICE
      : SHAREPOINT_LINK_BASE.CENTRAL_WORSHIP_SERVICE;
  }
}
