import { validateFormat } from 'ember-changeset-validations/validators';

export const telephoneValidations = {
  telephone: validateFormat({
    allowBlank: true,
    regex: /^\+?[0-9]*$/,
    message: 'Enkel een plusteken en cijfers zijn toegelaten',
  }),
};

export const websiteValidations = {
  website: validateFormat({
    allowBlank: true,
    regex: /^((?:https?:\/\/)[^.]+(?:\.[^.]+)+(?:\/.*)?)$/,
    message: 'Geef een geldig internetadres in',
  }),
};

const contactValidations = {
  ...telephoneValidations,
  ...websiteValidations,
};

export default contactValidations;
