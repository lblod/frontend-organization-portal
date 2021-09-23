import { validatePresence } from 'ember-changeset-validations/validators';

export default {
  name: validatePresence({ presence: true, ignoreBlank: true }),
  legalType: {
    label: validatePresence({ presence: true, ignoreBlank: true }),
  },
};
