import { validateFormat } from 'ember-changeset-validations/validators';

export default {
  telephone: validateFormat({
    allowBlank: true,
    regex: /^(tel:)?\+?[0-9]*$/,
    message: 'Enkel een plusteken en cijfers zijn toegelaten',
  }),
};
