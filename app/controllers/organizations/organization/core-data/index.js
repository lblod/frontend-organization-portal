import Controller from '@ember/controller';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

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
  IGS: 'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  POLICE_ZONE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  ASSISTANCE_ZONE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  OCMW_ASSOCIATION:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  PEVA_MUNICIPALITY:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
  PEVA_PROVINCE:
    'https://vlaamseoverheid.sharepoint.com/sites/Abb-LokFin/Lists/Organisaties/DispForm.aspx?ID=',
};

export default class OrganizationsOrganizationCoreDataIndexController extends Controller {
  @tracked showAbbData = true;
  @service features;

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

  get organizationIdentifiers() {
    return this.model.organization.hasMany('identifiers').value();
  }

  get sharepointIdentifier() {
    return this.organizationIdentifiers.find((id) =>
      this.isSharePointIdentifier(id),
    );
  }

  get kboIdentifier() {
    return this.organizationIdentifiers.find((id) => this.isKboIdentifier(id));
  }

  get nisIdentifier() {
    return this.organizationIdentifiers.find((id) =>
      this.isNisCodeIdentifier(id),
    );
  }

  get ovoIdentifier() {
    return this.organizationIdentifiers.find((id) =>
      this.isOvoCodeIdentifier(id),
    );
  }

  get sharePointLinkBase() {
    if (this.model.organization.isWorshipService) {
      return SHAREPOINT_LINK_BASE.WORSHIP_SERVICE;
    } else if (this.model.organization.isDistrict) {
      return SHAREPOINT_LINK_BASE.DISTRICT;
    } else if (this.model.organization.isProvince) {
      return SHAREPOINT_LINK_BASE.PROVINCE;
    } else if (this.model.organization.isMunicipality) {
      return SHAREPOINT_LINK_BASE.MUNICIPALITY;
    } else if (this.model.organization.isOCMW) {
      return SHAREPOINT_LINK_BASE.OCMW;
    } else if (this.model.organization.isAgb) {
      return SHAREPOINT_LINK_BASE.AGB;
    } else if (this.model.organization.isApb) {
      return SHAREPOINT_LINK_BASE.APB;
    } else if (this.model.organization.isIgs) {
      return SHAREPOINT_LINK_BASE.IGS;
    } else if (this.model.organization.isPoliceZone) {
      return SHAREPOINT_LINK_BASE.POLICE_ZONE;
    } else if (this.model.organization.isAssistanceZone) {
      return SHAREPOINT_LINK_BASE.ASSISTANCE_ZONE;
    } else if (this.model.organization.isOcmwAssociation) {
      return SHAREPOINT_LINK_BASE.OCMW_ASSOCIATION;
    } else if (this.model.organization.isPevaMunicipality) {
      return SHAREPOINT_LINK_BASE.PEVA_MUNICIPALITY;
    } else if (this.model.organization.isPevaProvince) {
      return SHAREPOINT_LINK_BASE.PEVA_PROVINCE;
    }
    return SHAREPOINT_LINK_BASE.CENTRAL_WORSHIP_SERVICE;
  }

  get expiredExpectedEndDate() {
    const expectedEndDate = this.model.organization.expectedEndDate;
    return expectedEndDate && expectedEndDate < new Date();
  }

  get vendorsString() {
    const vendors = this.model.organization.hasMany('vendors').value();
    if (!vendors || !vendors.length) {
      return 'Loket voor Lokale Besturen';
    }
    return vendors.map((item) => item.name).join(', ');
  }

  @action
  setShowAbbData(value) {
    this.showAbbData = value;
  }
}
