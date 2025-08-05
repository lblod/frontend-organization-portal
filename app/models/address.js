import { attr, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateStringOptional,
} from '../validators/schema';

const BELGIUM = 'België';

export default class AddressModel extends AbstractValidationModel {
  @attr number;
  @attr boxNumber;
  @attr street;
  @attr postcode;
  @attr municipality;
  @attr province;
  @attr addressRegisterUri;
  @attr country;
  @attr fullAddress;

  @belongsTo('concept', {
    inverse: null,
    async: true,
  })
  source;

  get isCountryBelgium() {
    return this.country === BELGIUM;
  }

  get isPostcodeInFlanders() {
    return (
      (this.postcode >= 1500 && this.postcode <= 3999) ||
      (this.postcode >= 8000 && this.postcode <= 9999)
    );
  }

  get validationSchema() {
    const REQUIRED_MESSAGE = 'Vul het volledige adres in';
    return Joi.object({
      street: Joi.string()
        .empty('')
        .required()
        .messages({ '*': REQUIRED_MESSAGE }),
      number: Joi.string()
        .empty('')
        .required()
        .messages({ '*': REQUIRED_MESSAGE }),
      postcode: Joi.string()
        .empty('')
        .required()
        .messages({ '*': REQUIRED_MESSAGE }),
      municipality: Joi.string()
        .empty('')
        .required()
        .messages({ '*': REQUIRED_MESSAGE }),
      country: Joi.string()
        .empty('')
        .required()
        .messages({ '*': REQUIRED_MESSAGE }),
      province: Joi.string()
        .empty('')
        .allow(null)
        .external(async (value, helpers) => {
          if (this.isCountryBelgium && this.isPostcodeInFlanders) {
            if (!value) {
              return helpers.message(REQUIRED_MESSAGE);
            }
          }

          return value;
        }),
      boxNumber: validateStringOptional(),
      fullAddress: validateStringOptional(),
      addressRegisterUri: validateStringOptional(),
      source: validateBelongsToOptional(),
    });
  }
}

export function combineFullAddress(address) {
  let fullAddress = [];

  const fullStreet = `${address.street || ''} ${address.number || ''} ${
    address.boxNumber || ''
  }`.trim();

  if (fullStreet) fullAddress.push(fullStreet);

  const municipalityInformation = `
    ${address.postcode || ''} ${address.municipality || ''}
  `.trim();

  if (municipalityInformation) fullAddress.push(municipalityInformation);

  const countryInformation = `${address.country || ''}`;

  if (countryInformation) fullAddress.push(countryInformation);

  if (fullAddress.length) {
    return fullAddress.join(', ');
  } else {
    return null;
  }
}

export function createAddress(store) {
  let record = store.createRecord('address');
  return record;
}
