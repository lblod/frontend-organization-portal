import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const EDITOR_ROLES = [
  'ABBOrganisatiePortaalGebruiker-editeerder',
  'ABBOrganisatiePortaalErediensten-editeerder',
  'ABBOrganisatiePortaalGebruiker-beheerder',
  'ABBOrganisatiePortaalErediensten-beheerder',
];

const WORSHIP_ROLES = [
  'ABBOrganisatiePortaalErediensten-beheerder',
  'ABBOrganisatiePortaalErediensten-editeerder',
  'ABBOrganisatiePortaalErediensten-lezer',
];

const UNIT_ROLES = [
  'ABBOrganisatiePortaalGebruiker-editeerder',
  'ABBOrganisatiePortaalGebruiker-beheerder',
  'ABBOrganisatiePortaalGebruiker-lezer',
];

const READER_ROLES = [
  'ABBOrganisatiePortaalErediensten-lezer',
  'ABBOrganisatiePortaalGebruiker-lezer',
];

export default class CurrentSessionService extends Service {
  @service session;
  @service store;
  @service role;

  @tracked account;
  @tracked user;
  @tracked group;
  @tracked roles;

  async load() {
    if (this.session.isAuthenticated) {
      let sessionData = this.session.data.authenticated.relationships;
      this.roles = [
        ...new Set(this.session.data.authenticated.data?.attributes?.roles),
      ];
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
    return WORSHIP_ROLES.includes(this.role.activeRole);
  }

  get hasUnitRole() {
    return UNIT_ROLES.includes(this.role.activeRole);
  }

  get canEdit() {
    return EDITOR_ROLES.includes(this.role.activeRole);
  }

  get canOnlyRead() {
    return READER_ROLES.includes(this.role.activeRole);
  }
}
