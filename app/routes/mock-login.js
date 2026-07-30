import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { query } from '@warp-drive/legacy/compat/builders';

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
    let { content } = await this.store.request(
      query('account', {
        include: 'user.groups',
        filter: { provider: 'https://github.com/lblod/mock-login-service' },
        page: { size: 10, number: params.page },
      })
    );

    return { accounts: content };
  }
}
