import { validateFormat } from 'ember-changeset-validations/validators';

export const contactValidations = {
  telephone: validateFormat({
    allowBlank: true,
    regex: /^\+?[0-9]*$/,
    message: 'Enkel een plusteken en cijfers zijn toegelaten',
  }),
  website: validateFormat({
    allowBlank: true,
    regex: /^((?:https?:\/\/)[^.]+(?:\.[^.]+)+(?:\/.*)?)$/,
    message: 'Geef een geldig internetadres in',
  }),
};
