import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const EDITOR_ROLES = [
  'ABBOrganisatiePortaalGebruiker-editeerder',
  'ABBOrganisatiePortaalGebruiker-worship-editeerder',
  'ABBOrganisatiePortaalGebruiker-beheerder',
  'ABBOrganisatiePortaalGebruiker-worship-beheerder',
];

const WORSHIP_ROLES = [
  'ABBOrganisatiePortaalGebruiker-worship-beheerder',
  'ABBOrganisatiePortaalGebruiker-worship-editeerder',
  'ABBOrganisatiePortaalGebruiker-worship-lezer',
];

const UNIT_ROLES = [
  'ABBOrganisatiePortaalGebruiker-editeerder',
  'ABBOrganisatiePortaalGebruiker-beheerder',
  'ABBOrganisatiePortaalGebruiker-lezer',
];

const READER_ROLES = [
  'ABBOrganisatiePortaalGebruiker-worship-lezer',
  'ABBOrganisatiePortaalGebruiker-lezer',
];

export default class CurrentSessionService extends Service {
  @service session;
  @service store;

  @tracked account;
  @tracked user;
  @tracked group;
  @tracked roles;
  @tracked _onlyWorshipContext;
  @tracked _onlyUnitContext;
  async load() {
    if (this.session.isAuthenticated) {
      let sessionData = this.session.data.authenticated.relationships;
      this.roles = this.session.data.authenticated.data?.attributes?.roles;
      let accountId = sessionData.account.data.id;

      this.account = await this.store.findRecord('account', accountId, {
        include: 'user',
      });
      this.user = this.account.user;

      // TODO no group / roles for now. not defined for acm idm, thus break the app when using acm idm login
      //let groupId = sessionData?.group?.data?.id;
      //this.group = await this.store.findRecord('group', groupId);
    }
  }
  get hasWorshipRole() {
    return (
      !this.onlyUnitContext &&
      this.roles.some((role) => WORSHIP_ROLES.includes(role))
    );
  }

  get hasUnitRole() {
    return (
      !this.onlyWorshipContext &&
      this.roles.some((role) => UNIT_ROLES.includes(role))
    );
  }

  get hasUnitRoleAndWorshipRole() {
    return this.hasWorshipRole && this.hasUnitRole;
  }

  get canEdit() {
    return this.roles.some((role) => EDITOR_ROLES.includes(role));
  }

  get canOnlyRead() {
    return (
      !this.canEdit && this.roles.some((role) => READER_ROLES.includes(role))
    );
  }

  set onlyWorshipContext(value) {
    this._onlyWorshipContext = value;
  }
  get onlyWorshipContext() {
    return this._onlyWorshipContext;
  }
  get onlyUnitContext() {
    return this._onlyUnitContext;
  }
  set onlyUnitContext(value) {
    this._onlyUnitContext = value;
  }
}
