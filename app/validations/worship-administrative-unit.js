import { validatePresence } from 'ember-changeset-validations/validators';

export default {
  name: validatePresence({ presence: true, ignoreBlank: true }),
  recognizedWorshipType: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),
  classification: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),
  organizationStatus: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),
  isAssociatedWith: validatePresence({
    presence: true,
    ignoreBlank: true,
    message: 'Selecteer een optie',
  }),
};
