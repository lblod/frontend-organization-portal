import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';

const SUBJECT = 'organization-portal-frontend';
const CREATOR =
  'http://lblod.data.gift/services/organization-portal-error-service';
export default class ErrorReportService extends Service {
  @service store;

  async reportError(message, detail, references = null) {
    let body = {
      data: {
        type: 'error-reports',
        attributes: {
          subject: SUBJECT,
          message: message,
          detail: detail,
          references: references,
          creator: CREATOR,
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
