import { validatePresence } from 'ember-changeset-validations/validators';

export default {
  givenName: validatePresence({ presence: true, ignoreBlank: true }),
  familyName: validatePresence({ presence: true, ignoreBlank: true }),
};
