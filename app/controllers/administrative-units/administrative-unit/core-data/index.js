import Controller from '@ember/controller';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import WorshipServiceModel from 'frontend-organization-portal/models/worship-service';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

const SHAREPOINT_LINK_BASE = {
  WORSHIP_SERVICE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-Erediensten/Lists/Lijst%20Eredienstbesturen/AllItems.aspx?view=7&q=',
  CENTRAL_WORSHIP_SERVICE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-Erediensten/Lists/Lijst%20CKB1/AllItems.aspx?view=7&q=',
  MUNICIPALITY:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  DISTRICT:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  PROVINCE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  OCMW: 'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  AGB: 'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  APB: 'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
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
    return this.model.identifiers.find((id) => this.isSharePointIdentifier(id));
  }

  get kboIdentifier() {
    return this.model.identifiers.find((id) => this.isKboIdentifier(id));
  }

  get nisIdentifier() {
    return this.model.identifiers.find((id) => this.isNisCodeIdentifier(id));
  }

  get ovoIdentifier() {
    return this.model.identifiers.find((id) => this.isOvoCodeIdentifier(id));
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

  get isProvince() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isDistrict() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.DISTRICT
    );
  }

  get isOCMW() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.OCMW
    );
  }

  get isAgb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.AGB
    );
  }
  get isApb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.APB
    );
  }

  get sharePointLinkBase() {
    if (this.isWorshipService) {
      return SHAREPOINT_LINK_BASE.WORSHIP_SERVICE;
    } else if (this.isDistrict) {
      return SHAREPOINT_LINK_BASE.DISTRICT;
    } else if (this.isProvince) {
      return SHAREPOINT_LINK_BASE.PROVINCE;
    } else if (this.isMunicipality) {
      return SHAREPOINT_LINK_BASE.MUNICIPALITY;
    } else if (this.isOCMW) {
      return SHAREPOINT_LINK_BASE.OCMW;
    } else if (this.isAgb) {
      return SHAREPOINT_LINK_BASE.AGB;
    } else if (this.isApb) {
      return SHAREPOINT_LINK_BASE.APB;
    }
    return SHAREPOINT_LINK_BASE.CENTRAL_WORSHIP_SERVICE;
  }
}
