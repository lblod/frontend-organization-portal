import { validatePresence } from 'ember-changeset-validations/validators';
import { validateUrl } from 'frontend-organization-portal/validators/url';

const REQUIRED_MESSAGE = 'Vul de datum in.';

export const changeEventValidations = {
  date: validatePresence({
    presence: true,
    message: REQUIRED_MESSAGE,
    ignoreBlank: true,
  }),
};

export const decisionValidations = {
  documentLink: validateUrl(),
};
