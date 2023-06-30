import { validatePresence } from 'ember-changeset-validations/validators';

export function getAddressValidations(isAlwaysRequired = false) {
  const REQUIRED_MESSAGE = 'Vul het volledige adres in';
  let isProvinceRequired = isAlwaysRequired;
  let addressValidation = {
    street: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
      on: isAlwaysRequired
        ? null
        : ['number', 'postcode', 'municipality', 'province', 'country'],
    }),
    number: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
      on: isAlwaysRequired
        ? null
        : ['street', 'postcode', 'municipality', 'province', 'country'],
    }),
    postcode: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
      on: isAlwaysRequired
        ? null
        : ['street', 'number', 'municipality', 'province', 'country'],
    }),
    municipality: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
      on: isAlwaysRequired
        ? null
        : ['street', 'number', 'postcode', 'province', 'country'],
    }),
    country: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
      on: isAlwaysRequired
        ? null
        : ['street', 'number', 'postcode', 'municipality', 'province'],
    }),
  };
  if (isProvinceRequired) {
    addressValidation.province = validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
    });
  }
  return addressValidation;
}
