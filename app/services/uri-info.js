import Service from '@ember/service';
import fetch from 'fetch';
import config from 'frontend-organization-portal/config/environment';
import { assert } from '@ember/debug';

/**
 *Service which interacts with the mu-uri-info-service microservice:
 *
 * https://github.com/redpencilio/mu-uri-info-service
 */
export default class UriInfoService extends Service {
  async getAllLinks(subject) {
    validateSubject(subject);

    return await this._getInfo(this._buildUrl({ subject }));
  }

  async getDirectLinks(subject, page, pageSize) {
    validateSubject(subject);

    return await this._getInfo(
      this._buildUrl({ path: '/direct', subject, page, pageSize }),
    );
  }

  async getInverseLinks(subject, page, pageSize) {
    validateSubject(subject);

    return await this._getInfo(
      this._buildUrl({ path: '/inverse', subject, page, pageSize }),
    );
  }

  _buildUrl({ path = '', subject, page, pageSize }) {
    assert(
      '`uriInfoServiceUrl` needs to be configured in the config/environment.js file',
      typeof config.uriInfoServiceUrl === 'string',
    );

    let url = `${config.uriInfoServiceUrl}${path}?subject=${subject}`;

    if (page) {
      url += `&pageNumber=${page}`;
    }

    if (pageSize) {
      url += `&pageSize=${pageSize}`;
    }

    return url;
  }

  async _getInfo(url) {
    let response = await fetch(url);

    return await response.json();
  }
}

function validateSubject(subject) {
  assert('uri-info: subject is required', typeof subject === 'string');
}
