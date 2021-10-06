import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';
import { validateConditionally } from 'frontend-contact-hub/validators/validate-conditionally';

export const contactValidations = {
  telephone: validateFormat({
    allowBlank: true,
    regex: /^\+32[0-9]{8,9}$/,
    message: 'Enkel een plusteken en cijfers toegelaten.',
  }),
  website: validateFormat({
    allowBlank: true,
    type: 'url',
    message: 'Geef een geldig internetadres in.',
  }),
};

export const addressValidations = {
  street: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
  number: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
  postcode: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
  municipality: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
  province: validateConditionally(
    validatePresence({
      presence: true,
      ignoreBlank: true,
      message: 'Vul het volledige adres in.',
    }),
    isPrimarySite
  ),
};

async function isPrimarySite() {
  return true;
}
