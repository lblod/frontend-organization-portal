import Controller from '@ember/controller';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import WorshipServiceModel from 'frontend-organization-portal/models/worship-service';

const SHAREPOINT_LINK_BASE = {
  WORSHIP_SERVICE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-Erediensten/Lists/Lijst%20Eredienstbesturen/AllItems.aspx?view=7&q=',
  CENTRAL_WORSHIP_SERVICE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-Erediensten/Lists/Lijst%20CKB1/AllItems.aspx?view=7&q=',
};

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexController extends Controller {
  isSharePointIdentifier(identifier) {
    return identifier?.idName === ID_NAME.SHAREPOINT;
  }

  isKboIdentifier(identifier) {
    return identifier?.idName === ID_NAME.KBO;
  }

  get sharepointIdentifier() {
    return this.model.administrativeUnit.identifiers.find((id) =>
      this.isSharePointIdentifier(id)
    );
  }

  get kboIdentifier() {
    return this.model.administrativeUnit.identifiers.find((id) =>
      this.isKboIdentifier(id)
    );
  }

  get isWorshipService() {
    return this.model.administrativeUnit instanceof WorshipServiceModel;
  }

  get sharePointLinkBase() {
    return this.isWorshipService
      ? SHAREPOINT_LINK_BASE.WORSHIP_SERVICE
      : SHAREPOINT_LINK_BASE.CENTRAL_WORSHIP_SERVICE;
  }
}
