import { attr, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import { validateRequiredWhenAll } from '../validators/schema';

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
  })
  source;

  get isCountryBelgium() {
    return this.country === 'België';
  }

  get validationSchema() {
    const REQUIRED_MESSAGE = 'Vul het volledige adres in';
    return Joi.object({
      street: validateRequiredWhenAll(
        ['number', 'postcode', 'municipality', 'province', 'country'],
        REQUIRED_MESSAGE
      ),
      number: validateRequiredWhenAll(
        ['street', 'postcode', 'municipality', 'province', 'country'],
        REQUIRED_MESSAGE
      ),
      postcode: validateRequiredWhenAll(
        ['street', 'number', 'municipality', 'province', 'country'],
        REQUIRED_MESSAGE
      ),
      municipality: validateRequiredWhenAll(
        ['street', 'number', 'postcode', 'province', 'country'],
        REQUIRED_MESSAGE
      ),
      country: validateRequiredWhenAll(
        ['street', 'number', 'postcode', 'municipality', 'province'],
        REQUIRED_MESSAGE
      ),
      // The `external` method is used here as a workaround for a circular dependency error with `when`.
      province: Joi.string().external((value, helpers) => {
        if (this.isCountryBelgium && !value) {
          return helpers.message(REQUIRED_MESSAGE);
        }
        return value;
      }),
      'box-number': Joi.string(),
      'full-address': Joi.string(),
      'address-register-uri': Joi.string(),
      source: Joi.object(),
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
