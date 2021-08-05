import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentSessionService extends Service {
  @service session;
  @service store;

  @tracked account;
  @tracked user;
  @tracked group;

  async load() {
    if (this.session.isAuthenticated) {
      let sessionData = this.session.data.authenticated.relationships;

      let accountId = sessionData.account.data.id;

      this.account = await this.store.findRecord('account', accountId, {
        include: 'user',
      });
      this.user = this.account.user;

      let groupId = sessionData.group.data.id;
      this.group = await this.store.findRecord('group', groupId);
    }
  }
}
