import { attr, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import { object, string, lazy } from 'yup';

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
    // lazy it's used to avoid Cyclic dependency errors : https://github.com/jquense/yup/issues/1576#issuecomment-1026827272
    return object().shape({
      street: lazy(() =>
        string().requiredWhenAll(
          ['number', 'postcode', 'municipality', 'province', 'country'],
          REQUIRED_MESSAGE
        )
      ),
      number: lazy(() =>
        string().requiredWhenAll(
          ['street', 'postcode', 'municipality', 'province', 'country'],
          REQUIRED_MESSAGE
        )
      ),
      postcode: lazy(() =>
        string().requiredWhenAll(
          ['street', 'number', 'municipality', 'province', 'country'],
          REQUIRED_MESSAGE
        )
      ),
      municipality: lazy(() =>
        string().requiredWhenAll(
          ['street', 'number', 'postcode', 'province', 'country'],
          REQUIRED_MESSAGE
        )
      ),
      country: lazy(() =>
        string().requiredWhenAll(
          ['street', 'number', 'postcode', 'municipality', 'province'],
          REQUIRED_MESSAGE
        )
      ),
      province: string().when(['country'], {
        is: (country) => {
          console.log('country is: ', country);
          return country === 'België';
        },
        then: (schema) => schema.required(REQUIRED_MESSAGE),
      }),
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
