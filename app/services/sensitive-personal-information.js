import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';

const PRIVACY_CENTRIC_SERVICE_ENDPOINT = {
  REQUEST: '/person-information-requests',
  UPDATE: '/person-information-updates',
};

export default class SensitivePersonalInformationService extends Service {
  @service store;

  /**
   * Request sensitive information from a specific person
   *
   * @param {PersonModel} person
   * @param {RequestReasonModel} requestReason
   * @returns {Promise<SensitivePersonalInformation>}
   */
  async getInformation(person, requestReason) {
    let body = {
      data: {
        type: 'person-information-requests',
        relationships: {
          person: {
            data: {
              type: 'people',
              id: person.id,
            },
          },
          reason: {
            data: {
              type: 'request-reasons',
              id: requestReason.id,
            },
          },
        },
      },
    };

    let response = await this._request(
      PRIVACY_CENTRIC_SERVICE_ENDPOINT.REQUEST,
      body
    );
    let data = (await response.json()).data;

    let sensitiveInformation = {};
    if (data?.attributes?.['date-of-birth']) {
      sensitiveInformation.dateOfBirth = new Date(
        data.attributes['date-of-birth']
      );
    }

    if (data?.attributes?.registration) {
      sensitiveInformation.ssn = data.attributes.registration;
    }

    if (data?.relationships?.nationalities?.data?.length > 0) {
      let idList = data.relationships.nationalities.data
        .map((nationaly) => nationaly.id)
        .join();
      let nationalities = await this.store.query('nationality', {
        filter: {
          ':id:': idList,
        },
      });
      sensitiveInformation.nationalities = nationalities.toArray();
    }

    if (data?.relationships?.gender?.data?.id) {
      let gender = await this.store.findRecord(
        'gender-code',
        data.relationships.gender.data.id
      );
      sensitiveInformation.gender = gender;
    }

    return new SensitivePersonalInformation(sensitiveInformation);
  }

  /**
   * Update sensitive information for a specific person
   *
   * @param {PersonModel} person
   * @param {RequestReasonModel} updateReason
   * @returns {Promise}
   */
  async updateInformation(sensitiveInformation, person, updateReason) {
    await this._request(
      PRIVACY_CENTRIC_SERVICE_ENDPOINT.UPDATE,
      generateUpdateRequestBody(sensitiveInformation, person, updateReason)
    );
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

export class SensitivePersonalInformation {
  @tracked dateOfBirth;
  @tracked ssn;
  @tracked gender;
  @tracked nationalities;

  constructor({
    dateOfBirth = null,
    ssn = '',
    gender = null,
    nationalities = [],
  } = {}) {
    this.dateOfBirth = dateOfBirth;
    this.ssn = ssn;
    this.gender = gender;
    this.nationalities = nationalities;
  }
}

function generateUpdateRequestBody(information, person, reason) {
  let body = {
    data: {
      type: 'person-information-updates',
      attributes: {
        'date-of-birth': information.dateOfBirth,
        registration: information.ssn,
      },
      relationships: {
        person: {
          data: {
            type: 'people',
            id: person.id,
          },
        },
        reason: {
          data: {
            type: 'request-reasons',
            id: reason.id,
          },
        },
        gender: null,
        nationalities: {
          data: [],
        },
      },
    },
  };

  if (information.gender) {
    body.data.relationships.gender = {
      data: {
        type: 'genders',
        id: information.gender.id,
      },
    };
  }

  if (
    Array.isArray(information.nationalities) &&
    information.nationalities.length > 0
  ) {
    body.data.relationships.nationalities = {
      data: information.nationalities.map((nationality) => ({
        type: 'nationalities',
        id: nationality.id,
      })),
    };
  }

  return body;
}
