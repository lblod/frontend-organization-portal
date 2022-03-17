import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';

const PRIVACY_CENTRIC_SERVICE_ENDPOINT = {
  REQUEST: '/person-information-requests',
  UPDATE: '/person-information-updates',
  ASK: '/person-information-ask',
  VALIDATE_SSN: '/person-information-validate-ssn',
};

export default class SensitivePersonalInformationService extends Service {
  @service store;

  /**
   * Check what sensitive data are present for a person
   * @param {PersonModel} person
   */
  async askInformation(person) {
    const askEndpoint = `${PRIVACY_CENTRIC_SERVICE_ENDPOINT.ASK}/${person.id}`;
    let response = await this._request(askEndpoint, {});
    let data = await response.json();
    return await this.mapSensitivePersonalInformation(data?.data, true);
  }

  /**
   * Check if ssn is valid
   * @param {PersonModel} person
   * @param {String} ssn
   */
  async validateSsn(person, ssn) {
    let validSsn = false;
    let sensitiveInformationError = null;
    if (!ssn || ssn?.length === 0) {
      validSsn = true;
    } else if (!/^[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{3}[0-9]{2}$/.test(ssn)) {
      sensitiveInformationError =
        'Vul het (elfcijferige) Rijksregisternummer in.';
    } else {
      const validateSsnEndpoint = `${PRIVACY_CENTRIC_SERVICE_ENDPOINT.VALIDATE_SSN}/${person.id}?ssn=${ssn}`;
      let response = await this._request(validateSsnEndpoint, {});
      let data = await response.json();
      validSsn = data?.data?.attributes['is-valid'];
      if (!validSsn) {
        sensitiveInformationError =
          'Dit rijksregisternummer al tot een persoon. Als je denkt dat er een fout is, meld het ons.';
      }
    }
    return { validSsn, sensitiveInformationError };
  }

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
    return await this.mapSensitivePersonalInformation(data);
  }

  async mapSensitivePersonalInformation(data, obfuscated = false) {
    let sensitiveInformation = {};
    let dateOfBirth = data?.attributes?.['date-of-birth'];
    let registration = data?.attributes?.registration;
    let nationalities = data?.relationships?.nationalities?.data;
    let genderData = data?.relationships?.gender?.data;
    if (dateOfBirth) {
      sensitiveInformation.dateOfBirth = obfuscated
        ? dateOfBirth
        : new Date(dateOfBirth);
    }

    if (registration) {
      sensitiveInformation.ssn = registration;
    }

    if (nationalities?.length > 0) {
      let idList = nationalities.map((nationaly) => nationaly.id).join();
      if (obfuscated) {
        sensitiveInformation.nationalities = idList;
      } else {
        let nationalities = await this.store.query('nationality', {
          filter: {
            ':id:': idList,
          },
        });
        sensitiveInformation.nationalities = nationalities.toArray();
      }
    }

    if (genderData?.id) {
      if (obfuscated) {
        sensitiveInformation.gender = genderData;
      } else {
        let gender = await this.store.findRecord('gender-code', genderData.id);
        sensitiveInformation.gender = gender;
      }
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
  isEmpty() {
    return (
      !this?.gender &&
      !this?.dateOfBirth &&
      !this?.nationalities?.length &&
      !this?.ssn
    );
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
