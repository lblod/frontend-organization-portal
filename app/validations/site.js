import { validatePresence } from 'ember-changeset-validations/validators';

export default {
  address: {
    street: validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
  },
};
