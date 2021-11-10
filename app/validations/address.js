import { validatePresence } from 'ember-changeset-validations/validators';

export function getAddressValidations(isAlwaysRequired = false) {
  const REQUIRED_MESSAGE = 'Vul het volledige adres in';

  return {
    street: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
      on: isAlwaysRequired
        ? null
        : ['number', 'postcode', 'municipality', 'province'],
    }),
    number: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
      on: isAlwaysRequired
        ? null
        : ['street', 'postcode', 'municipality', 'province'],
    }),
    postcode: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
      on: isAlwaysRequired
        ? null
        : ['street', 'number', 'municipality', 'province'],
    }),
    municipality: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: REQUIRED_MESSAGE,
      on: isAlwaysRequired
        ? null
        : ['street', 'number', 'postcode', 'province'],
    }),
  };
}
