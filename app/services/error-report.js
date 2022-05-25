import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';

export default class ErrorReportService extends Service {
  @service store;

  async reportError() {
    let body = {
      data: {
        type: 'error-reports',
        attributes: {
          subject: 'organization-portal-frontend',
          message: 'some error occured',
          detail: 'some error occured because of smth',
          references: 'http://xxx.com/person/1234/bestuur',
        },
        relationships: {},
      },
    };

    await this._request('/error-reports', body);
  }

  async _request(endpoint, body) {
    return await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify(body),
    });
  }
}
