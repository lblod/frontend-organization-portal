import Controller from '@ember/controller';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import WorshipServiceModel from 'frontend-organization-portal/models/worship-service';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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

  isNisCodeIdentifier(identifier) {
    return identifier?.idName === ID_NAME.NIS;
  }

  isOvoCodeIdentifier(identifier) {
    return identifier?.idName === ID_NAME.OVO;
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

  get nisIdentifier() {
    return this.model.administrativeUnit.identifiers.find((id) =>
      this.isNisCodeIdentifier(id)
    );
  }

  get ovoIdentifier() {
    return this.model.administrativeUnit.identifiers.find((id) =>
      this.isOvoCodeIdentifier(id)
    );
  }

  get isWorshipService() {
    return this.model.administrativeUnit instanceof WorshipServiceModel;
  }

  get isMunicipality() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get sharePointLinkBase() {
    return this.isWorshipService
      ? SHAREPOINT_LINK_BASE.WORSHIP_SERVICE
      : SHAREPOINT_LINK_BASE.CENTRAL_WORSHIP_SERVICE;
  }
}
