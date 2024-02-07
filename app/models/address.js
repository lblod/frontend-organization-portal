import { attr, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import { validateBelongsToOptional } from '../validators/schema';

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
        .when('country', {
          is: Joi.valid(BELGIUM),
          then: Joi.string().required().messages({ '*': REQUIRED_MESSAGE }),
          otherwise: Joi.string().empty('').allow(null),
        }),
      boxNumber: Joi.string().empty('').allow(null),
      fullAddress: Joi.string().empty(''),
      addressRegisterUri: Joi.string().empty(''),
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
