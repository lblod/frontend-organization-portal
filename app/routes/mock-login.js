import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MockLoginRoute extends Route {
  @service session;
  @service store;

  queryParams = {
    page: {
      refreshModel: true,
    },
  };

  beforeModel() {
    this.session.prohibitAuthentication('index');
  }

  async model(params) {
    let accounts = await this.store.query('account', {
      include: 'user.groups',
      filter: { provider: 'https://github.com/lblod/mock-login-service' },
      page: { size: 10, number: params.page },
    });

    return { accounts };
  }
}
